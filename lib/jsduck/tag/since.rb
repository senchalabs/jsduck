require "jsduck/tag/tag"
require "jsduck/logger"

module JsDuck::Tag
  class Since < Tag
    def initialize
      @pattern = "since"
      @tagname = :since
      @html_position = POS_SINCE
    end

    def parse_doc(p, pos)
      {
        :tagname => :since,
        :version => p.match(/.*$/).strip,
      }
    end

    def process_doc(h, tags, pos)
      h[:since] = tags[0][:version]
    end

    def to_html(context)
      <<-EOHTML
        <p>Available since: <b>#{context[:since]}</b></p>
      EOHTML
    end

  end
end
