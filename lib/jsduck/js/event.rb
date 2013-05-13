require "jsduck/util/singleton"

module JsDuck
  module Js

    # Auto-detection of events.
    class Event
      include Util::Singleton

      # Checks if AST node is an event, and if so, returns doc-hash
      # with event name and various auto-detected properties.
      # When not an event returns nil.
      def detect(ast, exp, var)
        # this.fireEvent("foo", ...)
        if exp && exp.fire_event?
          make(exp["arguments"][0].to_value)
        else
          nil
        end
      end

      # Produces a doc-hash for an event.
      def make(name)
        return {
          :tagname => :event,
          :name => name,
        }
      end

    end
  end
end
