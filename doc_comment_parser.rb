require 'strscan'

module JsDuck

  class DocCommentParser
    def parse(input)
      @root_tags = []
      add_root_tag(:default, {:doc => ""})
      @input = StringScanner.new(purify(input))
      parse_loop
      @root_tags.each {|tagset| trim_docs(tagset)}
      @root_tags
    end

    def add_root_tag(tagname, definition)
      # When previous tagset was an empty :default, then delete it
      if @root_tags.length == 1 &&
          @root_tags[0].keys.length == 1 &&
          @root_tags[0][:default] &&
          @root_tags[0][:default][:doc] == "" then
        @root_tags = []
      end
      @current_tag = definition
      @tags = {tagname => @current_tag}
      @root_tags << @tags
    end

    # curses the current :default tag into tagname.
    def set_root_tag(tagname)
      @current_tag = @tags[tagname] = @tags[:default]
      @tags.delete(:default)
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

    def parse_loop
      while !@input.eos? do
        if look(/@class\b/) then
          at_class
        elsif look(/@extends\b/) then
          at_extends
        elsif look(/@singleton\b/) then
          at_singleton
        elsif look(/@event\b/) then
          at_event
        elsif look(/@method\b/) then
          at_method
        elsif look(/@constructor\b/) then
          at_constructor
        elsif look(/@param\b/) then
          at_param
        elsif look(/@return\b/) then
          at_return
        elsif look(/@cfg\b/) then
          at_cfg
        elsif look(/@property\b/) then
          at_property
        elsif look(/@/) then
          @current_tag[:doc] += @input.scan(/@/)
        elsif look(/[^@]/) then
          @current_tag[:doc] += @input.scan(/[^@]+/)
        end
      end
    end

    # The parsing process can leave whitespace at the ends of
    # doc-strings, here we get rid of it.
    def trim_docs(tags)
      # trim the :doc property of each at-tag
      tags.each_value do |tag|
        if tag.instance_of?(Hash) && tag[:doc]
          tag[:doc].strip!
        end
      end
      # trim :doc properties of parameters
      tags[:param] && tags[:param].each {|p| p[:doc].strip! }
    end

    # matches @class name ...
    def at_class
      match(/@class/)
      add_root_tag(:class, {:doc => ""})
      skip_horiz_white
      if look(/\w/) then
        @current_tag[:name] = ident_chain
      end
      skip_white
    end

    # matches @extends name ...
    def at_extends
      match(/@extends/)
      unless @tags[:class]
        @tags[:class] = @tags[:default]
      end
      @current_tag = @tags[:class]
      skip_horiz_white
      if look(/\w/) then
        @current_tag[:extends] = ident_chain
      end
      skip_white
    end

    # matches @singleton
    def at_singleton
      match(/@singleton/)
      unless @tags[:class]
        @tags[:class] = @tags[:default]
      end
      @current_tag = @tags[:class]
      @current_tag[:singleton] = true
      skip_white
    end

    # matches @event name ...
    def at_event
      match(/@event/)
      add_root_tag(:event, {:doc => ""})
      maybe_name
      skip_white
    end

    # matches @method name ...
    def at_method
      match(/@method/)
      set_root_tag(:method)
      maybe_name
      skip_white
    end

    # matches @constructor ...
    # Which is equivalent of: @method constructor ...
    def at_constructor
      match(/@constructor/)
      add_root_tag(:method, {:doc => "", :name => "constructor"})
      skip_white
    end

    # matches @param {type} variable ...
    def at_param
      match(/@param/)
      @current_tag = {:doc => ""}
      if @tags[:param] then
        @tags[:param] << @current_tag
      else
        @tags[:param] = [@current_tag]
      end
      maybe_type
      maybe_name
      skip_white
    end

    # matches @return {type} ...
    def at_return
      match(/@return/)
      @current_tag = @tags[:return] = {:doc => ""}
      maybe_type
      skip_white
    end

    # matches @cfg {type} name ...
    def at_cfg
      match(/@cfg/)
      add_root_tag(:cfg, {:doc => ""})
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
      set_root_tag(:property)
      maybe_type
      maybe_name
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
