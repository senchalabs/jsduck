require "jsduck/tag/tag"

module JsDuck::Tag
  class Event < Tag
    def initialize
      @pattern = "event"
      @member_type = :event
    end

    # @event name ...
    def parse(p)
      {
        :tagname => :event,
        :name => p.hw.ident,
      }
    end
  end
end
