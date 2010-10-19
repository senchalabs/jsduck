require 'strscan'
require 'pp'

module JsDuck

  class DocComment
    def initialize(input)
      @current_tag = {:doc => ""}
      @tags = {:default => @current_tag}
      parse(purify(input))
    end

    # Sets the name property of the default at-tag.
    #
    # When name begins with uppercase it's considered to be class
    # name, otherwise a function name.
    #
    # When the name consists of several parts like foo.bar.baz, then
    # the parts should be passed as multiple arguments.
    def set_default_name(*name_chain)
      name = name_chain.last
      tagname = (name[0,1] == name[0,1].upcase) ? :class : :function

      if !@tags[:class] && !@tags[:function] && !@tags[:event] && !@tags[:cfg] then
        @tags[tagname] = {:name => (tagname == :function) ? name : name_chain.join(".")}
        @tags[tagname][:doc] = @tags[:default][:doc]
      end
    end

    # Sets default name for superclass
    def set_default_extends(*name_chain)
      @tags[:class] = {:doc => ""} unless @tags[:class]
      @tags[:class][:extends] = name_chain.join(".") unless @tags[:class][:extends]
    end

    # sets default names and possibly other properties of params
    def set_default_params(params)
      if @tags[:param] then
        0.upto(params.length-1) do |i|
          if @tags[:param][i] then
            params[i].each do |key, val|
              @tags[:param][i][key] = val unless @tags[:param][i][key]
            end
          else
            @tags[:param] << params[i]
          end
        end
      else
        @tags[:param] = params
      end
    end

    def [](tagname)
      @tags[tagname]
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

    def parse(input)
      @input = StringScanner.new(input)
      while !@input.eos? do
        if look(/@class\b/) then
          at_class
        elsif look(/@extends\b/) then
          at_extends
        elsif look(/@event\b/) then
          at_event
        elsif look(/@function\b/) then
          at_function
        elsif look(/@constructor\b/) then
          at_constructor
        elsif look(/@param\b/) then
          at_param
        elsif look(/@return\b/) then
          at_return
        elsif look(/@cfg\b/) then
          at_cfg
        elsif look(/@/) then
          @current_tag[:doc] += @input.scan(/@/)
        elsif look(/[^@]/) then
          @current_tag[:doc] += @input.scan(/[^@]+/)
        end
      end
      trim_docs
    end

    # The parsing process can leave whitespace at the ends of
    # doc-strings, here we get rid of it.
    def trim_docs
      # trim the :doc property of each at-tag
      @tags.each_value do |tag|
        if tag.instance_of?(Hash) && tag[:doc]
          tag[:doc].strip!
        end
      end
      # trim :doc properties of parameters
      @tags[:param] && @tags[:param].each {|p| p[:doc].strip!}
    end

    # matches @class name ...
    def at_class
      match(/@class/)
      @current_tag = @tags[:class] = {:doc => ""}
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident_chain
      end
      skip_white
    end

    # matches @extends name ...
    def at_extends
      match(/@extends/)
      unless @tags[:class]
        @tags[:class] = {:doc => ""}
      end
      @current_tag = @tags[:class]
      skip_white
      if look(/\w/) then
        @current_tag[:extends] = ident_chain
      end
      skip_white
    end

    # matches @event name ...
    def at_event
      match(/@event/)
      @current_tag = @tags[:event] = {:doc => ""}
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
    end

    # matches @function name ...
    def at_function
      match(/@function/)
      @current_tag = @tags[:function] = {:doc => ""}
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
    end

    # matches @constructor ...
    # Which is equivalent of: @function constructor ...
    def at_constructor
      match(/@constructor/)
      @current_tag = @tags[:function] = {:doc => "", :name => "constructor"}
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
      skip_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
    end

    # matches @return {type} ...
    def at_return
      match(/@return/)
      @current_tag = @tags[:return] = {:doc => ""}
      skip_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
      skip_white
    end

    # matches @cfg {type} name ...
    def at_cfg
      match(/@cfg/)
      @current_tag = @tags[:cfg] = {:doc => ""}
      skip_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
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

    def print
      pp @tags
    end
  end

end
