require 'jsduck/logger'

module JsDuck

  class Accessors
    # Given a class, generates accessor methods to configs with
    # @accessor tag.  Modifies the class by adding these methods.
    # When class already contains a getter or setter, the method is
    # not added.
    def create(cls)
      # Grab all configs tagged as @accessor
      accessors = cls[:members][:cfg].find_all {|cfg| cfg[:accessor] }

      # Build lookup table of method names
      methods = {}
      cls[:members][:method].each do |m|
        methods[m[:name]] = m;
      end

      accessors.each do |cfg|
        # add getter if no method with same name exists
        get = create_getter(cfg)
        if !methods[get[:name]]
          cls[:members][:method] << get
        end
        # add setter if no method with same name exists
        set = create_setter(cfg)
        if !methods[set[:name]]
          cls[:members][:method] << set
        end
      end
    end

    def create_getter(cfg)
      return {
        :tagname => :method,
        :name => "get" + upcase_first(cfg[:name]),
        :doc => "Returns the value of {@link #cfg-#{cfg[:name]}}.",
        :params => [],
        :return => {
          :type => cfg[:type],
          :doc => "",
        },
        :owner => cfg[:owner],
        :files => cfg[:files],
      }
    end

    def create_setter(cfg)
      return {
        :tagname => :method,
        :name => "set" + upcase_first(cfg[:name]),
        :doc => "Sets the value of {@link #cfg-#{cfg[:name]}}.",
        :params => [{
            :type => cfg[:type],
            :name => cfg[:name],
            :doc => "",
          }],
        :return => {
          :type => "undefined",
          :doc => "",
        },
        :owner => cfg[:owner],
        :files => cfg[:files],
      }
    end

    def upcase_first(str)
      str[0,1].upcase + str[1..-1]
    end
  end

end
