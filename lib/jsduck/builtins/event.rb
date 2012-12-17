require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Event < Tag
    def initialize
      @pattern = "event"
    end

    # @event name ...
    def parse(p)
      p.add_tag(:event)
      p.maybe_name
    end
  end
end
