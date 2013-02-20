require 'jsduck/doc/standard_tag_parser'

module JsDuck
  module Doc

    # Abstract base class for parsing doc-comments.
    #
    # The methods of this class are to be called from implementations
    # of concrete @tags.  Although the @tag classes will get passed an
    # instance of Doc::Parser, only methods of Doc::Scanner should be
    # called by them.
    #
    class Scanner
      def initialize
        @ident_pattern = /[$\w-]+/
        @ident_chain_pattern = /[$\w-]+(\.[$\w-]+)*/

        @input = nil # set to StringScanner in subclass
      end

      # Provides access to StringScanner
      attr_reader :input

      # Parses standard pattern common in several builtin tags, which
      # goes like this:
      #
      #     @tag {Type} [some.name=default]
      #
      # See StandardTagParser#parse for details.
      #
      def standard_tag(cfg)
        Doc::StandardTagParser.new(self).parse(cfg)
      end

      # matches chained.identifier.name and returns it
      def ident_chain
        @input.scan(@ident_chain_pattern)
      end

      # matches identifier and returns its name
      def ident
        @input.scan(@ident_pattern)
      end

      # Looks for the existance of pattern.  Returns the matching
      # string on success, nil on failure, but doesn't advance the
      # scan pointer.
      def look(re)
        @input.check(re)
      end

      # Matches the given pattern and advances the scan pointer
      # returning the string that matched.  When the pattern doesn't
      # match, nil is returned.
      def match(re)
        @input.scan(re)
      end

      # Skips all whitespace.  Moves scan pointer to next non-whitespace
      # character.
      def skip_white
        @input.scan(/\s+/)
      end

      # Skips horizontal whitespace (tabs and spaces).  Moves scan
      # pointer to next non-whitespace character or to the end of line.
      # Returns self to allow chaining.
      def hw
        @input.scan(/[ \t]+/)
        self
      end

    end

  end
end
