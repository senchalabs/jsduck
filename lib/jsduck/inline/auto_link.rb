require 'jsduck/logger'

module JsDuck
  module Inline

    # Takes care of the auto-detection of links in text.
    class AutoLink
      # Sets up instance to work in context of particular class, so it
      # knows that #blah is in context of SomeClass.
      attr_accessor :class_context

      # Sets up instance to work in context of particular doc object.
      # Used for error reporting.
      attr_accessor :doc_context

      def initialize(link_renderer)
        @class_context = ""
        @doc_context = {}
        @relations = link_renderer.relations
        @renderer = link_renderer
        @magic_link_re = magic_link_re
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
      def replace(input)
        input.gsub(@magic_link_re) do
          cls = $1 || $3
          member = $2 || $4
          replace_magic_link(cls, member)
        end
      end

      private

      # Generates regex for auto-linking class and member names in text.
      def magic_link_re
        ident_re = "(?:[A-Za-z_$][A-Za-z0-9_$]*)"
        cls_re = "(#{ident_re}(?:\\.#{ident_re})*)"
        ns_cls_re = "(#{ident_re}(?:\\.#{ident_re})+)"
        member_re = "(?:#(#{ident_re}))"
        /#{cls_re}#{member_re}|#{ns_cls_re}|#{member_re}/m
      end

      def replace_magic_link(cls, member)
        if cls && member
          if @relations[cls] && @renderer.get_matching_member(cls, {:name => member})
            return @renderer.link(cls, member, cls+"."+member)
          else
            warn_magic_link("#{cls}##{member} links to non-existing " + (@relations[cls] ? "member" : "class"))
          end
        elsif cls
          if @relations[cls]
            return @renderer.link(cls, nil, cls)
          else
            cls2, member2 = split_to_cls_and_member(cls)
            if @relations[cls2] && @renderer.get_matching_member(cls2, {:name => member2})
              return @renderer.link(cls2, member2, cls2+"."+member2)
            elsif cls =~ /\.(js|css|html|php)\Z/
              # Ignore common filenames
            else
              warn_magic_link("#{cls} links to non-existing class")
            end
          end
        else
          if @renderer.get_matching_member(@class_context, {:name => member})
            return @renderer.link(@class_context, member, member)
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

    end

  end
end
