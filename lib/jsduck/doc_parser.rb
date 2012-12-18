require 'strscan'
require 'jsduck/builtins_registry'
require 'jsduck/meta_tag_registry'
require 'jsduck/logger'

module JsDuck

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
  class DocParser
    def initialize
      @ident_pattern = /[$\w-]+/
      @ident_chain_pattern = /[$\w-]+(\.[$\w-]+)*/
      @builtins = BuiltinsRegistry
      @meta_tags = MetaTagRegistry.instance
    end

    BUILTIN_TAGS = {
      "xtype" => [:at_xtype, "widget"],
      "ftype" => [:at_xtype, "feature"],
      "ptype" => [:at_xtype, "plugin"],

      "type" => [:at_type],
      "inheritdoc" => [:at_inheritdoc],
      "inheritDoc" => [:at_inheritdoc],
      "alias" => [:at_alias_or_inheritdoc],
    }

    def parse(input, filename="", linenr=0)
      @filename = filename
      @linenr = linenr
      @tags = []
      @input = StringScanner.new(purify(input))

      parse_loop

      clean_empty_docs
      clean_empty_default_tag
      @tags
    end

    # Extracts content inside /** ... */
    def purify(input)
      result = []
      # We can have two types of lines:
      # - those beginning with *
      # - and those without it
      indent = nil
      input.each_line do |line|
        line.chomp!
        if line =~ /\A\s*\*\s?(.*)\Z/
          # When comment contains *-lines, switch indent-trimming off
          indent = 0
          result << $1
        elsif line =~ /\A\s*\Z/
          # pass-through empty lines
          result << line
        elsif indent == nil && line =~ /\A(\s*)(.*?\Z)/
          # When indent not measured, measure it and remember
          indent = $1.length
          result << $2
        else
          # Trim away indent if available
          result << line.sub(/\A\s{0,#{indent||0}}/, "")
        end
      end
      return result.join("\n")
    end

    # The parsing process can leave whitespace at the ends of
    # doc-strings, here we get rid of it.
    # Additionally null all empty docs.
    def clean_empty_docs
      @tags.each do |tag|
        tag[:doc].strip!
        tag[:doc] = nil if tag[:doc] == ""
      end
    end

    # Gets rid of empty default tag
    def clean_empty_default_tag
      if @tags.first && @tags.first[:tagname] == :default && !@tags.first[:doc]
        @tags.shift
      end
    end

    # The main loop of the DocParser
    def parse_loop
      add_tag(:default)

      while !@input.eos? do
        if look(/@/)
          parse_at_tag
        elsif look(/[^@]/)
          skip_to_next_at_tag
        end
      end
    end

    # Processes anything beginning with @-sign.
    #
    # - When @ is not followed by any word chards, do nothing.
    # - When it's one of the builtin tags, process it as such.
    # - When it's one of the meta-tags, process it as such.
    # - When it's something else, print a warning.
    #
    def parse_at_tag
      match(/@/)
      name = look(/\w+/)

      if !name
        # ignore
      elsif tagdef = BUILTIN_TAGS[name]
        match(/\w+/)
        send(*tagdef)
        skip_white
      elsif tag = @builtins[name]
        match(/\w+/)
        tag.parse(self)
        skip_white
      elsif tagdef = @meta_tags[name]
        match(/\w+/)
        parse_meta_tag(tagdef)
      else
        Logger.warn(:tag, "Unsupported tag: @#{name}", @filename, @linenr)
        @current_tag[:doc] += "@"
      end
    end

    # Matches the given meta-tag
    def parse_meta_tag(tag)
      prev_tag = @current_tag

      add_tag(:meta)
      @current_tag[:name] = tag.key
      skip_horiz_white

      if tag.boolean
        # For boolean tags, only scan the tag name and switch context
        # back to previous tag.
        skip_white
        @current_tag = prev_tag
      elsif tag.multiline
        # For multiline tags we leave the tag open for :doc addition
        # just like with built-in multiline tags.
      else
        # Fors singleline tags, scan to the end of line and finish the
        # tag.
        @current_tag[:doc] = match(/.*$/).strip
        skip_white
        @current_tag = prev_tag
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
      @current_tag[:doc] += match(/[^@]+/)

      while look(/@/) && (!prev_char_is_whitespace? || indented_as_code?)
        @current_tag[:doc] += match(/@+[^@]+/)
      end
    end

    def prev_char_is_whitespace?
      @current_tag[:doc][-1,1] =~ /\s/
    end

    def indented_as_code?
      @current_tag[:doc] =~ /^ {4,}[^\n]*\Z/
    end

    #
    # Routines for parsing of concrete tags...
    #

    # matches @type {type}  or  @type type
    #
    # The presence of @type implies that we are dealing with property.
    # ext-doc allows type name to be either inside curly braces or
    # without them at all.
    def at_type
      add_tag(:type)
      maybe_type
      if !@current_tag[:type] && look(/\S/)
        @current_tag[:type] = match(/\S+/)
      end
    end

    # matches @xtype/ptype/ftype/... name
    def at_xtype(namespace)
      add_tag(:alias)
      skip_horiz_white
      @current_tag[:name] = namespace + "." + (ident_chain || "")
    end

    # For backwards compatibility decide whether the @alias was used
    # as @inheritdoc (@alias used to have the meaning of @inheritdoc
    # before).
    def at_alias_or_inheritdoc
      if look(/\s+([\w.]+)?#\w+/)
        at_inheritdoc
      else
        at_alias
      end
    end

    # matches @alias <ident-chain>
    def at_alias
      add_tag(:alias)
      skip_horiz_white
      @current_tag[:name] = ident_chain
    end

    # matches @inheritdoc class.name#static-type-member
    def at_inheritdoc
      add_tag(:inheritdoc)
      skip_horiz_white

      if look(@ident_chain_pattern)
        @current_tag[:cls] = ident_chain
      end

      if look(/#\w/)
        match(/#/)
        if look(/static-/)
          @current_tag[:static] = true
          match(/static-/)
        end
        if look(/(cfg|property|method|event|css_var|css_mixin)-/)
          @current_tag[:type] = ident.to_sym
          match(/-/)
        end
        @current_tag[:member] = ident
      end
    end

    #
    # Parsing helpers ...
    #

    # Provides access to the tag that's currently being parsed
    attr_reader :current_tag

    # Appends new @tag to parsed tags list
    def add_tag(tag)
      @tags << @current_tag = {:tagname => tag, :doc => ""}
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
    def classname_list(propname)
      skip_horiz_white
      classes = []
      while look(@ident_chain_pattern)
        classes << ident_chain
        skip_horiz_white
      end
      @current_tag[propname] = classes
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
  end

end
