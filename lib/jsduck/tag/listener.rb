require "jsduck/tag/member_tag"
require "jsduck/params_merger"

module JsDuck::Tag
  class Listener < MemberTag
    def initialize
      @pattern = "listener"
      @tagname = :listener
      @member_type = {
        :title => "Listeners",
        :position => MEMBER_POS_LISTENER,
        :icon => File.dirname(__FILE__) + "/icons/listener.png"
      }
    end

    # @listener name ...
    def parse_doc(p, pos)
      {
        :tagname => :listener,
        :name => p.ident,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end

    def merge(h, docs, code)
      JsDuck::ParamsMerger.merge(h, docs, code)
    end

    def to_html(listener, cls)
      member_link(listener) + member_params(listener[:params])
    end
  end
end
