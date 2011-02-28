require 'strscan'

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
  # @see and {@link} are parsed separately in JsDuck::DocFormatter.
  #
  class DocParser
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
      # Remove the beginning /** and end */
      input = input.sub(/\A\/\*\* ?/, "").sub(/ ?\*\/\Z/, "")
      # Now we are left with only two types of lines:
      # - those beginning with *
      # - and those without it
      input.each_line do |line|
        line.chomp!
        if line =~ /\A\s*\*\s?(.*)\Z/
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
        if look(/@class\b/)
          at_class
        elsif look(/@extends\b/)
          at_extends
        elsif look(/@singleton\b/)
          boolean_at_tag(/@singleton/, :singleton)
        elsif look(/@event\b/)
          at_event
        elsif look(/@method\b/)
          at_method
        elsif look(/@constructor\b/)
          boolean_at_tag(/@constructor/, :constructor)
        elsif look(/@param\b/)
          at_param
        elsif look(/@returns?\b/)
          at_return
        elsif look(/@cfg\b/)
          at_cfg
        elsif look(/@property\b/)
          at_property
        elsif look(/@type\b/)
          at_type
        elsif look(/@xtype\b/)
          at_xtype
        elsif look(/@member\b/)
          at_member
        elsif look(/@author\b/)
          at_author
        elsif look(/@static\b/)
          boolean_at_tag(/@static/, :static)
        elsif look(/@(private|ignore|hide|protected)\b/)
          boolean_at_tag(/@(private|ignore|hide|protected)/, :private)
        elsif look(/@markdown\b/)
          # this is detected just to be ignored
          boolean_at_tag(/@markdown/, :markdown)
        elsif look(/@/)
          @current_tag[:doc] += @input.scan(/@/)
        elsif look(/[^@]/)
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
      if look(/\{/)
        @current_tag[:type] = typedef
      elsif look(/\S/)
        @current_tag[:type] = @input.scan(/\S+/)
      end
      skip_white
    end

    # matches @xtype name
    def at_xtype
      match(/@xtype/)
      add_tag(:xtype)
      maybe_name
      skip_white
    end

    # matches @member name ...
    def at_member
      match(/@member/)
      add_tag(:member)
      maybe_ident_chain(:member)
      skip_white
    end

    # matches @author some name ... newline
    def at_author
      match(/@author/)
      add_tag(:author)
      skip_horiz_white
      @current_tag[:name] = @input.scan(/.*$/)
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
      if look(/\{/)
        @current_tag[:type] = typedef
      end
    end

    # matches identifier name if possible and sets it on @current_tag
    def maybe_name
      skip_horiz_white
      if look(/\w/)
        @current_tag[:name] = ident
      end
    end

    # matches ident.chain if possible and sets it on @current_tag
    def maybe_ident_chain(propname)
      skip_horiz_white
      if look(/\w/)
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
