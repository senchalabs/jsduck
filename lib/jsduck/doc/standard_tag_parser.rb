require 'jsduck/doc/delimited_parser'

module JsDuck
  module Doc

    # Helper in parsing the standard tag pattern with type definition
    # followed by name and default value:
    #
    # @tag {Type} [some.name=default]
    #
    class StandardTagParser
      # Initialized with Doc::Scanner instance
      def initialize(doc_scanner)
        @ds = doc_scanner
        @delimited_parser = Doc::DelimitedParser.new(doc_scanner)
      end

      # Parses the standard tag pattern.
      #
      # Takes as parameter a configuration hash which can contain the
      # following keys:
      #
      # - :tagname => The :tagname of the hash to return.
      #
      # - :type => True to parse `{Type}` section.
      #
      # - :name => True to parse `some.name` section.
      #
      # - :default => True to parse `=<default-value>` after name.
      #
      # - :optional => True to allow placing name and default value
      #       inside [ and ] brackets to denote optionality.
      #       Also returns :optional=>true when {SomType=} syntax used.
      #
      # Returns tag definition hash containing the fields specified by
      # config.
      #
      def parse(cfg)
        @tagname = cfg[:tagname]
        tag = {}
        tag[:tagname] = cfg[:tagname] if cfg[:tagname]
        add_type(tag, cfg) if cfg[:type]
        add_name_with_default(tag, cfg) if cfg[:name]
        tag
      end

      private

      # matches {type} if possible and sets it on given tag hash.
      # Also checks for {optionality=} in type definition.
      def add_type(tag, cfg)
        if hw.look(/\{/)
          tdf = typedef
          tag[:type] = tdf[:type]
          tag[:optional] = true if tdf[:optional] && cfg[:optional]
        end
      end

      # matches {...=} and returns text inside brackets
      def typedef
        match(/\{/)

        name = @delimited_parser.parse_until_close_curly

        unless match(/\}/)
          warn("@#{@tagname} tag syntax: '}' expected")
        end

        if name =~ /=$/
          name = name.chop
          optional = true
        else
          optional = nil
        end

        return {:type => name, :optional => optional}
      end

      # matches:   <ident-chain>
      #          | <ident-chain> [ "=" <default-value>
      #          | "[" <ident-chain> [ "=" <default-value> ] "]"
      def add_name_with_default(tag, cfg)
        if hw.look(/\[/) && cfg[:optional]
          match(/\[/)
          tag[:name] = hw.ident_chain
          if hw.match(/=/)
            hw
            tag[:default] = @delimited_parser.parse_until_close_square
          end
          hw.match(/\]/) or warn("@#{@tagname} tag syntax: ']' expected")
          tag[:optional] = true
        elsif name = ident_chain
          tag[:name] = name
          if cfg[:default] && hw.match(/=/)
            hw
            tag[:default] = @delimited_parser.parse_until_space
          end
        end
      end

      ### Forward these calls to Doc::Scanner

      def ident_chain
        @ds.ident_chain
      end

      def look(re)
        @ds.look(re)
      end

      def match(re)
        @ds.match(re)
      end

      def hw
        @ds.hw
      end

      def warn(msg)
        @ds.warn(:tag_syntax, msg)
      end
    end

  end
end
