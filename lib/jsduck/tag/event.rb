require "jsduck/tag/tag"

module JsDuck::Tag
  class Event < Tag
    def initialize
      @pattern = "event"
      @key = :event
      @member_type = :event
    end

    # @event name ...
    def parse_doc(p)
      {
        :tagname => :event,
        :name => p.hw.ident,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end
  end
end
