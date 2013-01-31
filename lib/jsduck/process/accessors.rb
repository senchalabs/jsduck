require 'jsduck/logger'

module JsDuck
  module Process

    class Accessors
      def initialize(classes)
        @classes = classes
      end

      # Generates accessors in all classes.
      def process_all!
        @classes.each_value {|cls| process(cls) }
      end

      # Given a class, generates accessor methods to configs with
      # @accessor tag.  Modifies the class by adding these methods.
      # When class already contains a getter or setter, the method is
      # not added.
      def process(cls)
        # Grab all configs tagged as @accessor
        accessors = cls[:members].find_all {|m| m[:tagname] == :cfg && m[:accessor] }

        # Build lookup tables of method and event names
        methods = build_lookup_table(cls[:members], :method)
        events = build_lookup_table(cls[:members], :event)

        accessors.each do |cfg|
          # add getter if no method with same name exists
          get = create_getter(cfg)
          if !methods[get[:name]]
            cls[:members] << get
          end
          # add setter if no method with same name exists
          set = create_setter(cfg)
          if !methods[set[:name]]
            cls[:members] << set
          end
          # for evented accessors
          if cfg[:evented]
            # add event if no event with same name exists
            ev = create_event(cfg)
            if !events[ev[:name]]
              cls[:members] << ev
            end
          end
        end
      end

      def build_lookup_table(members, tagname)
        map = {}
        members.each do |m|
          map[m[:name]] = m if m[:tagname] == tagname
        end
        map
      end

      def create_getter(cfg)
        name = "get" + upcase_first(cfg[:name])
        return add_shared({
            :tagname => :method,
            :name => name,
            :doc => "Returns the value of {@link #cfg-#{cfg[:name]}}.",
            :params => [],
            :return => {
              :type => cfg[:type],
              :doc => "",
            },
            :id => "method-" + name,
          }, cfg)
      end

      def create_setter(cfg)
        name = "set" + upcase_first(cfg[:name]);
        return add_shared({
            :tagname => :method,
            :name => name,
            :doc => "Sets the value of {@link #cfg-#{cfg[:name]}}.",
            :params => [{
                :type => cfg[:type],
                :name => cfg[:name],
                :doc => "",
              }],
            :id => "method-" + name,
          }, cfg)
      end

      def create_event(cfg)
        name = cfg[:name].downcase + "change"
        setter_name = "set" + upcase_first(cfg[:name]);
        return add_shared({
            :tagname => :event,
            :name => name,
            :doc => "Fires when the {@link ##{cfg[:id]}} configuration is changed by {@link #method-#{setter_name}}.",
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
            :id => "event-" + name,
          }, cfg)
      end

      def add_shared(hash, cfg)
        hash.merge!({
            :owner => cfg[:owner],
            :files => cfg[:files],
            :private => cfg[:private],
            :protected => cfg[:protected],
            :autodetected => cfg[:autodetected],
            :hide => cfg[:hide],
          })
      end

      def upcase_first(str)
        str[0,1].upcase + str[1..-1]
      end
    end

  end
end
