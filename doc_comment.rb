
module JsDuck

  class DocComment
    def initialize(tags)
      @tags = tags

      [:class, :method, :event, :cfg].each do |name|
        if @tags[name] then
          @root_tag = @tags[name]
        end
      end
    end

    # Sets the name property of the default at-tag.
    #
    # When name begins with uppercase it's considered to be class
    # name, otherwise a method name.
    #
    # When the name consists of several parts like foo.bar.baz, then
    # the parts should be passed as multiple arguments.
    def set_default_name(*name_chain)
      name = name_chain.last
      tagname = (name[0,1] == name[0,1].upcase) ? :class : :method

      if !@root_tag then
        @root_tag = {:name => (tagname == :method) ? name : name_chain.join(".")}
        @root_tag[:doc] = @tags[:default][:doc]
        @tags[tagname] = @root_tag
        @tags.delete(:default)
      elsif !@root_tag[:name] then
        @root_tag[:name] = name
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
