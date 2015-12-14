require "jsduck/tag/member_tag"
require "jsduck/params_merger"

module JsDuck::Tag
  class Event < MemberTag
    def initialize
      @pattern = "event"
      @tagname = :event
      @member_type = {
        :title => "Events",
        :position => MEMBER_POS_EVENT,
        :icon => File.dirname(__FILE__) + "/icons/event.png"
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

    def merge(h, docs, code)
      JsDuck::ParamsMerger.merge(h, docs, code)
    end

    def to_html(event, cls)
      member_link(event) + member_params(event[:params])
    end
  end
end
