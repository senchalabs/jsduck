require 'jsduck/tag_registry'

module JsDuck

  # Abstract base class for parsing doc-comments.
  #
  # The methods of this class are to be called from implementations of
  # concrete @tags.  Although the @tag classes will get passed an
  # instance of DocParser, only methods of DocScanner should be called
  # by them.
  #
  class DocScanner
    def initialize
      @ident_pattern = /[$\w-]+/
      @ident_chain_pattern = /[$\w-]+(\.[$\w-]+)*/

      @tags = []
      @input = nil # set to StringScanner in subclass
    end

    # Provides access to the tag that's currently being parsed
    attr_reader :current_tag

    # Appends new @tag to parsed tags list
    def add_tag(tag)
      if tag.is_a?(Hash)
        @tags << @current_tag = tag
      else
        @tags << @current_tag = {:tagname => tag, :doc => ""}
      end

      @current_tag[:doc] = "" unless @current_tag.has_key?(:doc)
    end

    # Forgets the previously parsed tag
    def remove_last_tag
      @tags.pop
      @current_tag = @tags.last
    end

    # matches {type} if possible and sets it on @current_tag
    # Also checks for {optionality=} in type definition.
    def maybe_type
      skip_horiz_white
      if look(/\{/)
        tdf = typedef
        @current_tag[:type] = tdf[:type]
        @current_tag[:optional] = true if tdf[:optional]
      end
    end

    # matches: <ident-chain> | "[" <ident-chain> [ "=" <default-value> ] "]"
    def maybe_name_with_default
      skip_horiz_white
      if look(/\[/)
        match(/\[/)
        maybe_ident_chain(:name)
        skip_horiz_white
        if look(/=/)
          match(/=/)
          skip_horiz_white
          @current_tag[:default] = default_value
        end
        skip_horiz_white
        match(/\]/)
        @current_tag[:optional] = true
      else
        maybe_ident_chain(:name)
      end
    end

    # matches: "(optional)"
    def maybe_optional
      skip_horiz_white
      if look(/\(optional\)/i)
        match(/\(optional\)/i)
        @current_tag[:optional] = true
      end
    end

    # matches: "(required)"
    def maybe_required
      skip_horiz_white
      if look(/\(required\)/i)
        match(/\(required\)/i)
        @current_tag[:optional] = false
      end
    end

    # matches identifier name if possible and sets it on @current_tag
    def maybe_name
      skip_horiz_white
      if look(@ident_pattern)
        @current_tag[:name] = match(@ident_pattern)
      end
    end

    # matches ident.chain if possible and sets it on @current_tag
    def maybe_ident_chain(propname)
      skip_horiz_white
      if look(@ident_chain_pattern)
        @current_tag[propname] = ident_chain
      end
    end

    # matches a member reference: "#" <static> "-" <type> "-" <member>
    # setting the corresponding properties on @current_tag
    def maybe_member_reference
      if look(/#\w/)
        match(/#/)
        if look(/static-/)
          @current_tag[:static] = true
          match(/static-/)
        end
        if look(TagRegistry.member_type_regex)
          @current_tag[:type] = ident.to_sym
          match(/-/)
        end
        @current_tag[:member] = ident
      end
    end

    # Attempts to allow balanced braces in default value.
    # When the nested parsing doesn't finish at closing "]",
    # roll back to beginning and simply grab anything up to closing "]".
    def default_value
      start_pos = @input.pos
      value = parse_balanced(/\[/, /\]/, /[^\[\]'"]*/)
      if look(/\]/)
        value
      else
        @input.pos = start_pos
        match(/[^\]]*/)
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

    # matches <ident_chain> <ident_chain> ... until line end
    def classname_list
      skip_horiz_white
      classes = []
      while look(@ident_chain_pattern)
        classes << ident_chain
        skip_horiz_white
      end
      classes
    end

    # matches chained.identifier.name and returns it
    def ident_chain
      @input.scan(@ident_chain_pattern)
    end

    # matches identifier and returns its name
    def ident
      @input.scan(/\w+/)
    end

    def look(re)
      @input.check(re)
    end

    def match(re)
      @input.scan(re)
    end

    def skip_white
      @input.scan(/\s+/)
    end

    # skips horizontal whitespace (tabs and spaces)
    def skip_horiz_white
      @input.scan(/[ \t]+/)
    end
    # Shorthand alias
    def hw
      skip_horiz_white
    end

  end

end
