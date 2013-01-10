module JsDuck

  # Helper in parsing the standard tag pattern with type definition
  # followed by name and default value:
  #
  # @tag {Type} [some.name=default]
  #
  class StandardTagParser
    # Initialized with DocScanner instance
    def initialize(doc_scanner)
      @ds = doc_scanner
    end

    # Parses the standard tag pattern.
    #
    # Takes as parameter a configuration hash which can contain the
    # following keys:
    #
    # - :tagname => The :tagname of the hash to return.
    #
    # - :type => True to parse {Type} section.
    #            Produces :type and :optional keys.
    #
    # - :name => Trye to parse [some.name=default] section.
    #            Produces :name, :default and :optional keys.
    #
    # Returns tag definition hash containing the given :tagname and a
    # set of other fields depending on whether :type and :name configs
    # were specified and how their matching succeeded.
    #
    def parse(cfg)
      tag = {:tagname => cfg[:tagname]}
      add_type(tag) if cfg[:type]
      add_name_with_default(tag) if cfg[:name]
      tag
    end

    private

    # matches {type} if possible and sets it on given tag hash.
    # Also checks for {optionality=} in type definition.
    def add_type(tag)
      if hw.look(/\{/)
        tdf = typedef
        tag[:type] = tdf[:type]
        tag[:optional] = true if tdf[:optional]
      end
    end

    # matches {...=} and returns text inside brackets
    def typedef
      match(/\{/)

      name = parse_balanced(/\{/, /\}/, /[^{}'"]*/)

      if name =~ /=$/
        name = name.chop
        optional = true
      else
        optional = nil
      end

      match(/\}/)

      return {:type => name, :optional => optional}
    end

    # matches: <ident-chain> | "[" <ident-chain> [ "=" <default-value> ] "]"
    def add_name_with_default(tag)
      if hw.match(/\[/)
        tag[:name] = hw.ident_chain
        if hw.match(/=/)
          hw
          tag[:default] = default_value
        end
        hw.match(/\]/)
        tag[:optional] = true
      else
        tag[:name] = hw.ident_chain
      end
    end

    # Attempts to allow balanced braces in default value.
    # When the nested parsing doesn't finish at closing "]",
    # roll back to beginning and simply grab anything up to closing "]".
    def default_value
      start_pos = @ds.input.pos
      value = parse_balanced(/\[/, /\]/, /[^\[\]'"]*/)
      if look(/\]/)
        value
      else
        @ds.input.pos = start_pos
        match(/[^\]]*/)
      end
    end

    # Helper method to parse a string up to a closing brace,
    # balancing opening-closing braces in between.
    #
    # @param re_open  The beginning brace regex
    # @param re_close The closing brace regex
    # @param re_rest  Regex to match text without any braces and strings
    def parse_balanced(re_open, re_close, re_rest)
      result = parse_with_strings(re_rest)
      while look(re_open)
        result += match(re_open)
        result += parse_balanced(re_open, re_close, re_rest)
        result += match(re_close)
        result += parse_with_strings(re_rest)
      end
      result
    end

    # Helper for parse_balanced to parse rest of the text between
    # braces, taking account the strings which might occur there.
    def parse_with_strings(re_rest)
      result = match(re_rest)
      while look(/['"]/)
        result += parse_string('"') if look(/"/)
        result += parse_string("'") if look(/'/)
        result += match(re_rest)
      end
      result
    end

    # Parses "..." or '...' including the escape sequence \' or '\"
    def parse_string(quote)
      re_quote = Regexp.new(quote)
      re_rest = Regexp.new("(?:[^"+quote+"\\\\]|\\\\.)*")
      match(re_quote) + match(re_rest) + (match(re_quote) || "")
    end

    ### Forward these calls to DocScanner

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
  end

end
