# -*- coding: utf-8 -*-
require 'rubygems'
require 'strscan'
require 'rdiscount'
require 'jsduck/logger'
require 'jsduck/inline_img'
require 'jsduck/inline_video'
require 'jsduck/html'

module JsDuck

  # Formats doc-comments
  class DocFormatter
    # Template HTML that replaces {@link Class#member anchor text}.
    # Can contain placeholders:
    #
    # %c - full class name (e.g. "Ext.Panel")
    # %m - class member name prefixed with member type (e.g. "method-urlEncode")
    # %# - inserts "#" if member name present
    # %- - inserts "-" if member name present
    # %a - anchor text for link
    #
    # Default value: '<a href="%c%M">%a</a>'
    attr_accessor :link_tpl

    # Sets up instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    attr_accessor :class_context

    # Sets up instance to work in context of particular doc object.
    # Used for error reporting.
    attr_accessor :doc_context

    # Maximum length for text that doesn't get shortened, defaults to 120
    attr_accessor :max_length

    # JsDuck::Relations for looking up class names.
    #
    # When auto-creating class links from CamelCased names found from
    # text, we check the relations object to see if a class with that
    # name actually exists.
    attr_accessor :relations

    def initialize(relations={}, opts={})
      @class_context = ""
      @doc_context = {}
      @max_length = 120
      @relations = relations
      @images = []

      @inline_img = InlineImg.new(opts)
      @inline_video = InlineVideo.new(opts)

      @link_tpl = opts[:link_tpl] || '<a href="%c%#%m">%a</a>'
      @link_re = /\{@link\s+(\S*?)(?:\s+(.+?))?\}/m

      @example_annotation_re = /<pre><code>\s*@example( +[^\n]*)?\s+/m
    end

    # Sets base path to prefix images from {@img} tags.
    def img_path=(path)
      @inline_img.base_path = path
    end

    # Returns list of all image paths gathered from {@img} tags.
    def images
      @inline_img.images
    end

    # Replaces {@link} and {@img} tags, auto-generates links for
    # recognized classnames.
    #
    # Replaces {@link Class#member link text} in given string with
    # HTML from @link_tpl.
    #
    # Replaces {@img path/to/image.jpg Alt text} with HTML from @img_tpl.
    #
    # Adds 'inline-example' class to code examples beginning with @example.
    #
    # Additionally replaces strings recognized as ClassNames or
    # #members with links to these classes or members.  So one doesn't
    # even need to use the @link tag to create a link.
    def replace(input)
      s = StringScanner.new(input)
      out = ""

      # Keep track of the nesting level of <a> tags. We're not
      # auto-detecting class names when inside <a>. Normally links
      # shouldn't be nested, but just to be extra safe.
      open_a_tags = 0

      while !s.eos? do
        if s.check(@link_re)
          out += replace_link_tag(s.scan(@link_re))
        elsif substitute = @inline_img.replace(s)
          out += substitute
        elsif substitute = @inline_video.replace(s, @doc_context)
          out += substitute
        elsif s.check(/[{]/)
          # There might still be "{" that doesn't begin {@link} or {@img} - ignore it
          out += s.scan(/[{]/)
        elsif s.check(@example_annotation_re)
          # Match possible classnames following @example and add them
          # as CSS classes inside <pre> element.
          s.scan(@example_annotation_re) =~ @example_annotation_re
          css_classes = ($1 || "").strip
          out += "<pre class='inline-example #{css_classes}'><code>"
        elsif s.check(/<a\b/)
          # Increment number of open <a> tags.
          open_a_tags += 1
          out += s.scan_until(/>|\Z/)
        elsif s.check(/<\/a>/)
          # <a> closed, auto-detection may continue when no more <a> tags open.
          open_a_tags -= 1
          out += s.scan(/<\/a>/)
        elsif s.check(/</)
          # Ignore all other HTML tags
          out += s.scan_until(/>|\Z/)
        else
          # Replace class names in the following text up to next "<" or "{"
          # but only when we're not inside <a>...</a>
          text = s.scan(/[^{<]+/)
          out += open_a_tags > 0 ? text : create_magic_links(text)
        end
      end
      out
    end

    def replace_link_tag(input)
      input.sub(@link_re) do
        target = $1
        text = $2
        if target =~ /^(.*)#(static-)?(?:(cfg|property|method|event|css_var|css_mixin)-)?(.*)$/
          cls = $1.empty? ? @class_context : $1
          static = $2 ? true : nil
          type = $3 ? $3.intern : nil
          member = $4
        else
          cls = target
          static = nil
          type = false
          member = false
        end

        # Construct link text
        if text
          text = text
        elsif member
          text = (cls == @class_context) ? member : (cls + "." + member)
        else
          text = cls
        end

        file = @doc_context[:filename]
        line = @doc_context[:linenr]
        if !@relations[cls]
          Logger.instance.warn(:link, "#{input} links to non-existing class", file, line)
          return text
        elsif member
          ms = find_members(cls, {:name => member, :tagname => type, :static => static})
          if ms.length == 0
            Logger.instance.warn(:link, "#{input} links to non-existing member", file, line)
            return text
          end

          if ms.length > 1
            # When multiple public members, see if there remains just
            # one when we ignore the static members. If there's more,
            # report ambiguity. If there's only static members, also
            # report ambiguity.
            instance_ms = ms.find_all {|m| !m[:meta][:static] }
            if instance_ms.length > 1
              alternatives = instance_ms.map {|m| "#{m[:tagname]} in #{m[:owner]}" }.join(", ")
              Logger.instance.warn(:link_ambiguous, "#{input} is ambiguous: "+alternatives, file, line)
            elsif instance_ms.length == 0
              static_ms = ms.find_all {|m| m[:meta][:static] }
              alternatives = static_ms.map {|m| "static " + m[:tagname].to_s }.join(", ")
              Logger.instance.warn(:link_ambiguous, "#{input} is ambiguous: "+alternatives, file, line)
            end
          end

          return link(cls, member, text, type, static)
        else
          return link(cls, false, text)
        end
      end
    end

    # Looks input text for patterns like:
    #
    #  My.ClassName
    #  MyClass#method
    #  #someProperty
    #
    # and converts them to links, as if they were surrounded with
    # {@link} tag. One notable exception is that Foo is not created to
    # link, even when Foo class exists, but Foo.Bar is. This is to
    # avoid turning normal words into links. For example:
    #
    #     Math involves a lot of numbers. Ext JS is a JavaScript framework.
    #
    # In these sentences we don't want to link "Math" and "Ext" to the
    # corresponding JS classes.  And that's why we auto-link only
    # class names containing a dot "."
    #
    def create_magic_links(input)
      cls_re = "([A-Z][A-Za-z0-9.]*[A-Za-z0-9])"
      member_re = "(?:#([A-Za-z0-9]+))"

      input.gsub(/\b#{cls_re}#{member_re}?\b|#{member_re}\b/m) do
        replace_magic_link($1, $2 || $3)
      end
    end

    def replace_magic_link(cls, member)
      if cls && member
        if @relations[cls] && get_matching_member(cls, {:name => member})
          return link(cls, member, cls+"."+member)
        else
          warn_magic_link("#{cls}##{member} links to non-existing " + (@relations[cls] ? "member" : "class"))
        end
      elsif cls && cls =~ /\./
        if @relations[cls]
          return link(cls, nil, cls)
        else
          cls2, member2 = split_to_cls_and_member(cls)
          if @relations[cls2] && get_matching_member(cls2, {:name => member2})
            return link(cls2, member2, cls2+"."+member2)
          elsif cls =~ /\.(js|css|html|php)\Z/
            # Ignore common filenames
          else
            warn_magic_link("#{cls} links to non-existing class")
          end
        end
      elsif !cls && member
        if get_matching_member(@class_context, {:name => member})
          return link(@class_context, member, member)
        elsif member =~ /\A([A-F0-9]{3}|[A-F0-9]{6})\Z/i || member =~ /\A[0-9]/
          # Ignore HEX color codes and
          # member names beginning with number
        else
          warn_magic_link("##{member} links to non-existing member")
        end
      end

      return "#{cls}#{member ? '#' : ''}#{member}"
    end

    def split_to_cls_and_member(str)
      parts = str.split(/\./)
      return [parts.slice(0, parts.length-1).join("."), parts.last]
    end

    def warn_magic_link(msg)
      Logger.instance.warn(:link_auto, msg, @doc_context[:filename], @doc_context[:linenr])
    end

    # applies the link template
    def link(cls, member, anchor_text, type=nil, static=nil)
      # Use the canonical class name for link (not some alternateClassName)
      cls = @relations[cls].full_name
      # prepend type name to member name
      member = member && get_matching_member(cls, {:name => member, :tagname => type, :static => static})

      @link_tpl.gsub(/(%[\w#-])/) do
        case $1
        when '%c'
          cls
        when '%m'
          member ? member[:id] : ""
        when '%#'
          member ? "#" : ""
        when '%-'
          member ? "-" : ""
        when '%a'
          HTML.escape(anchor_text||"")
        else
          $1
        end
      end
    end

    def get_matching_member(cls, query)
      ms = find_members(cls, query).find_all {|m| !m[:private] }
      if ms.length > 1
        instance_ms = ms.find_all {|m| !m[:meta][:static] }
        instance_ms.length > 0 ? instance_ms[0] : ms.find_all {|m| m[:meta][:static] }[0]
      else
        ms[0]
      end
    end

    def find_members(cls, query)
      @relations[cls] ? @relations[cls].find_members(query) : []
    end

    # Formats doc-comment for placement into HTML.
    # Renders it with Markdown-formatter and replaces @link-s.
    def format(input)
      # In ExtJS source "<pre>" is often at the end of paragraph, not
      # on its own line.  But in that case RDiscount doesn't recognize
      # it as the beginning of <pre>-block and goes on parsing it as
      # normal Markdown, which often causes nested <pre>-blocks.
      #
      # To prevent this, we always add extra newline before <pre>.
      input.gsub!(/([^\n])<pre>/, "\\1\n<pre>")

      # But we remove trailing newline after <pre> to prevent
      # code-blocks beginning with empty line.
      input.gsub!(/<pre>(<code>)?\n?/, "<pre>\\1")

      replace(RDiscount.new(input).to_html)
    end

    # Shortens text
    #
    # 116 chars is also where ext-doc makes its cut, but unlike
    # ext-doc we only make the cut when there's more than 120 chars.
    #
    # This way we don't get stupid expansions like:
    #
    #   Blah blah blah some text...
    #
    # expanding to:
    #
    #   Blah blah blah some text.
    #
    def shorten(input)
      sent = first_sentence(HTML.strip_tags(input).strip)
      # Use u-modifier to correctly count multi-byte characters
      chars = sent.scan(/./mu)
      if chars.length > @max_length
        chars[0..(@max_length-4)].join + "..."
      else
        sent + " ..."
      end
    end

    def first_sentence(str)
      str.sub(/\A(.+?(\.|。))\s.*\Z/mu, "\\1")
    end

    # Returns true when input should get shortened.
    def too_long?(input)
      stripped = HTML.strip_tags(input).strip
      # for sentence v/s full - compare byte length
      # for full v/s max - compare char length
      first_sentence(stripped).length < stripped.length || stripped.scan(/./mu).length > @max_length
    end

  end

end
