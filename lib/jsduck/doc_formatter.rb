require 'rubygems'
require 'rdiscount'
require 'strscan'
require 'cgi'
require 'jsduck/logger'

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

    # Template HTML that replaces {@img URL alt text}
    # Can contain placeholders:
    #
    # %u - URL from @img tag (e.g. "some/path.png")
    # %a - alt text for image
    #
    # Default value: '<img src="%u" alt="%a"/>'
    attr_accessor :img_tpl

    # This will hold list of all image paths gathered from {@img} tags.
    attr_accessor :images

    # Base path to prefix images from {@img} tags.
    # Defaults to no prefix.
    attr_accessor :img_path

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
      @link_tpl = opts[:link_tpl] || '<a href="%c%#%m">%a</a>'
      @img_tpl = opts[:img_tpl] || '<img src="%u" alt="%a"/>'
      @link_re = /\{@link\s+(\S*?)(?:\s+(.+?))?\}/m
      @img_re = /\{@img\s+(\S*?)(?:\s+(.+?))?\}/m
      @example_annotation_re = /<pre><code>\s*@example( +[^\n]*)?\s+/m
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
    # Additionally replaces strings recognized as ClassNames with
    # links to these classes.  So one doesn even need to use the @link
    # tag to create a link.
    def replace(input)
      s = StringScanner.new(input)
      out = ""
      while !s.eos? do
        if s.check(@link_re)
          out += replace_link_tag(s.scan(@link_re))
        elsif s.check(@img_re)
          out += replace_img_tag(s.scan(@img_re))
        elsif s.check(@example_annotation_re)
          # Match possible classnames following @example and add them
          # as CSS classes inside <pre> element.
          s.scan(@example_annotation_re) =~ @example_annotation_re
          css_classes = ($1 || "").strip
          out += "<pre class='inline-example #{css_classes}'><code>"
        elsif s.check(/[{<]/)
          out += s.scan(/[{<]/)
        else
          out += replace_class_names(s.scan(/[^{<]+/))
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
          static = !!$2
          type = $3 ? $3.intern : nil
          member = $4
        else
          cls = target
          static = false
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
          ms = get_members(cls, member, type, static)
          if ms.length == 0
            Logger.instance.warn(:link, "#{input} links to non-existing member", file, line)
            return text
          end

          ms = ms.find_all {|m| !m[:private] }
          if ms.length == 0
            Logger.instance.warn(:link_private, "#{input} links to private member", file, line)
            return text
          end

          if ms.length > 1
            # When multiple public members, see if there remains just
            # one when we ignore the static members. If there's more,
            # report ambiguity. If there's only static members, also
            # report ambiguity.
            instance_ms = ms.find_all {|m| !m[:meta][:static] }
            if instance_ms.length > 1
              alternatives = instance_ms.map {|m| m[:tagname].to_s }.join(", ")
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

    def replace_img_tag(input)
      input.sub(@img_re) { img($1, $2) }
    end

    def replace_class_names(input)
      input.gsub(/(\A|\s)([A-Z][A-Za-z0-9.]*[A-Za-z0-9])(?:(#)([A-Za-z0-9]+))?([.,]?(?:\s|\Z))/m) do
        before = $1
        cls = $2
        hash = $3
        member = $4
        after = $5

        if @relations[cls] && (member ? get_matching_member(cls, member) : cls =~ /\./)
          label = member ? cls+"."+member : cls
          before + link(cls, member, label) + after
        else
          before + cls + (hash || "") + (member || "") + after
        end
      end
    end

    # applies the image template
    def img(url, alt_text)
      @images << url
      @img_tpl.gsub(/(%\w)/) do
        case $1
        when '%u'
          @img_path ? (@img_path + "/" + url) : url
        when '%a'
          CGI.escapeHTML(alt_text||"")
        else
          $1
        end
      end
    end

    # applies the link template
    def link(cls, member, anchor_text, type=nil, static=false)
      # Use the canonical class name for link (not some alternateClassName)
      cls = @relations[cls].full_name
      # prepend type name to member name
      member = member && get_matching_member(cls, member, type, static)

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
          CGI.escapeHTML(anchor_text||"")
        else
          $1
        end
      end
    end

    def get_matching_member(cls, member, type=nil, static=false)
      ms = get_members(cls, member, type, static).find_all {|m| !m[:private] }
      if ms.length > 1
        instance_ms = ms.find_all {|m| !m[:meta][:static] }
        instance_ms.length > 0 ? instance_ms[0] : ms.find_all {|m| m[:meta][:static] }[0]
      else
        ms[0]
      end
    end

    def get_members(cls, member, type=nil, static=false)
      @relations[cls] ? @relations[cls].get_members(member, type, static) : []
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
      sent = first_sentence(strip_tags(input))
      if sent.length > @max_length
        sent[0..(@max_length-4)] + "..."
      else
        sent + " ..."
      end
    end

    def first_sentence(str)
      str.sub(/\A(.+?\.)\s.*\Z/m, "\\1")
    end

    # Returns true when input should get shortened.
    def too_long?(input)
      stripped = strip_tags(input)
      first_sentence(stripped).length < stripped.length || stripped.length > @max_length
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "").strip
    end
  end

end
