require "jsduck/tag/member_tag"
require "jsduck/render/method_signature"

module JsDuck::Tag
  class Event < MemberTag
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

    def to_html(event, cls)
      JsDuck::Render::MethodSignature.render(event, cls)
    end
  end
end
