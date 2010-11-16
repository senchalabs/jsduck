require 'strscan'

module JsDuck

  class DocCommentParser
    def parse(input)
      @tags = []
      @input = StringScanner.new(purify(input))
      parse_loop
      # The parsing process can leave whitespace at the ends of
      # doc-strings, here we get rid of it.  Additionally null all empty docs
      @tags.each do |tag|
        tag[:doc].strip!
        tag[:doc] = nil if tag[:doc] == ""
      end
      # Get rid of empty default tag
      if @tags.first && @tags.first[:tagname] == :default && !@tags.first[:doc]
        @tags.shift
      end
      @tags
    end

    # Extracts content inside /** ... */
    def purify(input)
      result = []
      input.each_line do |line|
        line.chomp!
        if line =~ /\A\/\*\*/ || line =~ /\*\/\Z/ then
          # ignore first and last line
        elsif line =~ /\A\s*\*\s?(.*)\Z/ then
          result << $1
        else
          result << line
        end
      end
      return result.join("\n")
    end

    def add_tag(tag)
      @tags << @current_tag = {:tagname => tag, :doc => ""}
    end

    def parse_loop
      add_tag(:default)
      while !@input.eos? do
        if look(/@class\b/) then
          at_class
        elsif look(/@extends\b/) then
          at_extends
        elsif look(/@singleton\b/) then
          boolean_at_tag(/@singleton/, :singleton)
        elsif look(/@event\b/) then
          at_event
        elsif look(/@method\b/) then
          at_method
        elsif look(/@constructor\b/) then
          boolean_at_tag(/@constructor/, :constructor)
        elsif look(/@param\b/) then
          at_param
        elsif look(/@returns?\b/) then
          at_return
        elsif look(/@cfg\b/) then
          at_cfg
        elsif look(/@property\b/) then
          at_property
        elsif look(/@type\b/) then
          at_type
        elsif look(/@private\b/) then
          boolean_at_tag(/@private/, :private)
        elsif look(/@ignore\b/) then
          boolean_at_tag(/@ignore/, :private)
        elsif look(/@hide\b/) then
          boolean_at_tag(/@hide/, :private)
        elsif look(/@static\b/) then
          boolean_at_tag(/@static/, :static)
        elsif look(/@/) then
          @current_tag[:doc] += @input.scan(/@/)
        elsif look(/[^@]/) then
          @current_tag[:doc] += @input.scan(/[^@]+/)
        end
      end
    end

    # matches @class name ...
    def at_class
      match(/@class/)
      add_tag(:class)
      maybe_ident_chain(:name)
      skip_white
    end

    # matches @extends name ...
    def at_extends
      match(/@extends/)
      add_tag(:extends)
      maybe_ident_chain(:extends)
      skip_white
    end

    # matches @event name ...
    def at_event
      match(/@event/)
      add_tag(:event)
      maybe_name
      skip_white
    end

    # matches @method name ...
    def at_method
      match(/@method/)
      add_tag(:method)
      maybe_name
      skip_white
    end

    # matches @param {type} variable ...
    def at_param
      match(/@param/)
      add_tag(:param)
      maybe_type
      maybe_name
      skip_white
    end

    # matches @return {type} ...
    def at_return
      match(/@returns?/)
      add_tag(:return)
      maybe_type
      skip_white
    end

    # matches @cfg {type} name ...
    def at_cfg
      match(/@cfg/)
      add_tag(:cfg)
      maybe_type
      maybe_name
      skip_white
    end

    # matches @property {type} name ...
    #
    # ext-doc doesn't support {type} and name for @property - name is
    # inferred from source and @type is required to specify type,
    # jsdoc-toolkit on the other hand follows the sensible route, and
    # so do we.
    def at_property
      match(/@property/)
      add_tag(:property)
      maybe_type
      maybe_name
      skip_white
    end

    # matches @type {type}  or  @type type
    #
    # The presence of @type implies that we are dealing with property.
    # ext-doc allows type name to be either inside curly braces or
    # without them at all.
    def at_type
      match(/@type/)
      add_tag(:type)
      skip_horiz_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      elsif look(/\S/) then
        @current_tag[:type] = @input.scan(/\S+/)
      end
      skip_white
    end

    # Used to match @private, @ignore, @hide, ...
    def boolean_at_tag(regex, propname)
      match(regex)
      add_tag(propname)
      skip_white
    end

    # matches {type} if possible and sets it on @current_tag
    def maybe_type
      skip_horiz_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
    end

    # matches identifier name if possible and sets it on @current_tag
    def maybe_name
      skip_horiz_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
    end

    # matches ident.chain if possible and sets it on @current_tag
    def maybe_ident_chain(propname)
      skip_horiz_white
      if look(/\w/) then
        @current_tag[propname] = ident_chain
      end
    end

    # matches {...} and returns text inside brackets
    def typedef
      match(/\{/)
      name = @input.scan(/[^}]+/)
      match(/\}/)
      return name
    end

    # matches chained.identifier.name and returns it
    def ident_chain
      @input.scan(/[\w.]+/)
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
