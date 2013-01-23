require 'strscan'
require 'jsduck/doc/comment'
require 'jsduck/doc/scanner'
require 'jsduck/tag_registry'
require 'jsduck/logger'

module JsDuck
  module Doc

    # Parses doc-comment into array of @tags
    #
    # For each @tag it produces Hash like the following:
    #
    #     {
    #       :tagname => :cfg/:property/:type/:extends/...,
    #       :doc => "Some documentation for this tag",
    #       ...@tag specific stuff like :name, :type, and so on...
    #     }
    #
    # When doc-comment begins with comment, not preceded by @tag, then
    # the comment will be placed into Hash with :tagname => :default.
    #
    # Unrecognized @tags are left as is into documentation as if they
    # were normal text.
    #
    # @example, {@img}, {@link} and {@video} are parsed separately in
    # JsDuck::DocFormatter.
    #
    class Parser < Doc::Scanner
      def parse(input, filename="", linenr=0)
        @filename = filename
        @linenr = linenr
        @tags = []
        @input = StringScanner.new(Doc::Comment.purify(input))

        parse_loop

        strip_docs
        @tags
      end

      # The parsing process can leave whitespace at the ends of
      # doc-strings, here we get rid of it.
      def strip_docs
        @tags.each do |tag|
          tag[:doc].strip! if tag[:doc]
        end
      end

      # The main loop of the DocParser
      def parse_loop
        add_tag({:tagname => :doc, :doc => :multiline})

        while !@input.eos? do
          if look(/@/)
            parse_at_tag
          elsif look(/[^@]/)
            skip_to_next_at_tag
          end
        end
      end

      # Appends new @tag to parsed tags list
      def add_tag(tag)
        @tags << tag

        if tag[:doc] == :multiline
          tag[:doc] = ""
          @multiline_tag = tag
        end
      end

      # Processes anything beginning with @-sign.
      #
      # - When @ is not followed by any word chars, do nothing.
      # - When it's one of the builtin tags, process it as such.
      # - When it's something else, print a warning.
      #
      def parse_at_tag
        match(/@/)
        name = look(/\w+/)

        if !name
          # ignore
        elsif tag = TagRegistry.get_by_pattern(name)
          match(/\w+/)

          tags = tag.parse_doc(self)
          if tags.is_a?(Hash)
            add_tag(tags)
          elsif tags.is_a?(Array)
            tags.each {|t| add_tag(t) }
          end

          skip_white
        else
          Logger.warn(:tag, "Unsupported tag: @#{name}", @filename, @linenr)
          @multiline_tag[:doc] += "@"
        end
      end

      # Skips until the beginning of next @tag.
      #
      # There must be space before the next @tag - this ensures that we
      # don't detect tags inside "foo@example.com" or "{@link}".
      #
      # Also check that the @tag is not part of an indented code block -
      # in which case we also ignore the tag.
      def skip_to_next_at_tag
        @multiline_tag[:doc] += match(/[^@]+/)

        while look(/@/) && (!prev_char_is_whitespace? || indented_as_code?)
          @multiline_tag[:doc] += match(/@+[^@]+/)
        end
      end

      def prev_char_is_whitespace?
        @multiline_tag[:doc][-1,1] =~ /\s/
      end

      def indented_as_code?
        @multiline_tag[:doc] =~ /^ {4,}[^\n]*\Z/
      end
    end

  end
end
