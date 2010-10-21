
module JsDuck

  class DocComment
    def initialize(tags)
      @tags = tags
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
      elsif @tags[:class] && !@tags[:class][:name] then
        @tags[:class][:name] = name
      elsif @tags[:function] && !@tags[:function][:name] then
        @tags[:function][:name] = name
      elsif @tags[:event] && !@tags[:event][:name] then
        @tags[:event][:name] = name
      elsif @tags[:cfg] && !@tags[:cfg][:name] then
        @tags[:cfg][:name] = name
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
  end

end
