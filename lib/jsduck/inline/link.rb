require 'jsduck/util/html'
require 'jsduck/logger'

module JsDuck
  module Inline

    # Implementation of inline tag {@link}
    #
    # It also takes care of the auto-detection of links in text
    # through the #create_magic_links method.
    class Link
      # Sets up instance to work in context of particular class, so
      # that when {@link #blah} is encountered it knows that
      # Context#blah is meant.
      attr_accessor :class_context

      # Sets up instance to work in context of particular doc object.
      # Used for error reporting.
      attr_accessor :doc_context

      # JsDuck::Relations for looking up class names.
      #
      # When auto-creating class links from CamelCased names found from
      # text, we check the relations object to see if a class with that
      # name actually exists.
      attr_accessor :relations

      def initialize(opts={})
        @class_context = ""
        @doc_context = {}
        @relations = {}

        # Template HTML that replaces {@link Class#member anchor text}.
        # Can contain placeholders:
        #
        # %c - full class name (e.g. "Ext.Panel")
        # %m - class member name prefixed with member type (e.g. "method-urlEncode")
        # %# - inserts "#" if member name present
        # %- - inserts "-" if member name present
        # %a - anchor text for link
        @tpl = opts[:link_tpl] || '<a href="%c%#%m">%a</a>'

        @re = /\{@link\s+(\S*?)(?:\s+(.+?))?\}/m
      end

      # Takes StringScanner instance.
      #
      # Looks for inline tag at the current scan pointer position, when
      # found, moves scan pointer forward and performs the apporpriate
      # replacement.
      def replace(input)
        if input.check(@re)
          input.scan(@re).sub(@re) { apply_tpl($1, $2, $&) }
        else
          false
        end
      end

      # applies the link template
      def apply_tpl(target, text, full_link)
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
          Logger.warn(:link, "#{full_link} links to non-existing class", file, line)
          return text
        elsif member
          ms = find_members(cls, {:name => member, :tagname => type, :static => static})
          if ms.length == 0
            Logger.warn(:link, "#{full_link} links to non-existing member", file, line)
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
              Logger.warn(:link_ambiguous, "#{full_link} is ambiguous: "+alternatives, file, line)
            elsif instance_ms.length == 0
              static_ms = ms.find_all {|m| m[:meta][:static] }
              alternatives = static_ms.map {|m| "static " + m[:tagname].to_s }.join(", ")
              Logger.warn(:link_ambiguous, "#{full_link} is ambiguous: "+alternatives, file, line)
            end
          end

          return link(cls, member, text, type, static)
        else
          return link(cls, false, text)
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
        Logger.warn(:link_auto, msg, @doc_context[:filename], @doc_context[:linenr])
      end

      # applies the link template
      def link(cls, member, anchor_text, type=nil, static=nil)
        # Use the canonical class name for link (not some alternateClassName)
        cls = @relations[cls][:name]
        # prepend type name to member name
        member = member && get_matching_member(cls, {:name => member, :tagname => type, :static => static})

        @tpl.gsub(/(%[\w#-])/) do
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
            Util::HTML.escape(anchor_text||"")
          else
            $1
          end
        end
      end

      def get_matching_member(cls, query)
        ms = find_members(cls, query)
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

    end

  end
end
