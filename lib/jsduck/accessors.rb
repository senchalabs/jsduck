require 'jsduck/logger'

module JsDuck

  class Accessors
    # Given a class, generates accessor methods to configs with
    # @accessor tag.  Modifies the class by adding these methods.
    # When class already contains a getter or setter, the method is
    # not added.
    def create(cls)
      # Grab all configs tagged as @accessor
      accessors = cls[:members][:cfg].find_all {|cfg| cfg[:accessor] && !cfg[:private] }

      # Build lookup tables of method and event names
      methods = build_lookup_table(cls[:members][:method])
      events = build_lookup_table(cls[:members][:event])

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
        # for evented accessors
        if cfg[:evented]
          # add event if no event with same name exists
          ev = create_event(cfg)
          if !events[ev[:name]]
            cls[:members][:event] << ev
          end
        end
      end
    end

    def build_lookup_table(members)
      map = {}
      members.each {|m| map[m[:name]] = m }
      map
    end

    def create_getter(cfg)
      name = "get" + upcase_first(cfg[:name])
      return {
        :tagname => :method,
        :name => name,
        :doc => "Returns the value of {@link #cfg-#{cfg[:name]}}.",
        :params => [],
        :return => {
          :type => cfg[:type],
          :doc => "",
        },
        :owner => cfg[:owner],
        :files => cfg[:files],
        :id => "method-" + name,
        :deprecated => cfg[:deprecated],
      }
    end

    def create_setter(cfg)
      name = "set" + upcase_first(cfg[:name]);
      return {
        :tagname => :method,
        :name => name,
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
        :id => "method-" + name,
        :deprecated => cfg[:deprecated],
      }
    end

    def create_event(cfg)
      name = cfg[:name].downcase + "change"
      setter_name = "set" + upcase_first(cfg[:name]);
      return {
        :tagname => :event,
        :name => name,
        :doc =>
          "Fires when the {@link ##{cfg[:id]}} configuration is changed by {@link #method-#{setter_name}}." +
          "\n\n" +
          "Note that this event is fired *before* the value of {@link ##{cfg[:id]}} has been updated, " +
          "and that you can return false from any listener to the #{name} event " +
          "to cancel the change.",
        :params => [
          {
            :name => "this",
            :type => cfg[:owner],
            :doc => "The #{cfg[:owner]} instance."
          },
          {
            :name => "value",
            :type => cfg[:type],
            :doc => "The new value being set."
          },
          {
            :name => "oldValue",
            :type => cfg[:type],
            :doc => "The existing value."
          },
        ],
        :owner => cfg[:owner],
        :files => cfg[:files],
        :id => "event-" + name,
        :deprecated => cfg[:deprecated],
      }
    end

    def upcase_first(str)
      str[0,1].upcase + str[1..-1]
    end
  end

end
