require 'jsduck/logger'

module JsDuck
  module Process

    # Expands lists of fired events to take into account events fired
    # by all the methods that get called by a method.
    class Fires
      def initialize(relations)
        @relations = relations
        # Map of methods for which all @fires tags have been detected.
        # So we don't repeat the resolving.
        @detected = {}
        # Map of methods that we're currently resolving.
        # So we don't recurse into infinity.
        @call_chain = {}
      end

      # Populates @fires tags with additional events.
      def process_all!
        @relations.each do |cls|
          cls.find_members(:tagname => :method, :static => false).each do |m|
            @call_chain = {m[:name] => true}
            detect_fires(cls, m)
          end
        end
      end

      private

      def detect_fires(cls, m)
        if m[:autodetected][:fires] && m[:method_calls] && !detected?(m)
          m[:fires] = events_from_methods(cls, m[:method_calls]).concat(m[:fires] || []).sort.uniq
          mark_detected(m)
        end

        m[:fires]
      end

      def mark_detected(m)
        @detected[m[:owner]] = {} unless @detected[m[:owner]]
        @detected[m[:owner]][m[:name]] = true
      end

      def detected?(m)
        cls = @detected[m[:owner]]
        cls && cls[m[:name]]
      end

      def events_from_methods(cls, methods)
        events = []

        methods.each do |name|
          if !@call_chain[name]
            @call_chain[name] = true
            m = cls.find_members(:tagname => :method, :name => name, :static => false)[0]
            if m
              fires = detect_fires(cls, m)
              events.concat(fires) if fires
            end
            @call_chain[name] = false
          end
        end

        events.sort.uniq
      end

    end

  end
end
