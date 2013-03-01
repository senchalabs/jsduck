require "jsduck/tag/tag"

module JsDuck::Tag
  class Event < Tag
    def initialize
      @pattern = "event"
      @tagname = :event
      @member_type = {
        :name => :event,
        :category => :method_like,
        :title => "Events",
        :position => MEMBER_POS_EVENT,
      }
    end

    # @event name ...
    def parse_doc(p, pos)
      {
        :tagname => :event,
        :name => p.ident,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end
  end
end
