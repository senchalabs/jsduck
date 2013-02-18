require "jsduck/tag/tag"
require "jsduck/logger"

module JsDuck::Tag
  class Since < Tag
    def initialize
      @pattern = "since"
      @tagname = :since
      @html_position = POS_SINCE
    end

    def parse_doc(p)
      {
        :tagname => :since,
        :version => p.hw.match(/.*$/).strip,
      }
    end

    def process_doc(h, tags, pos)
      if tags.length > 1
        JsDuck::Logger.warn(nil, "Only one @since tag allowed per class/member.")
      end

      h[:since] = tags[0][:version]
    end

    def to_html(context)
      <<-EOHTML
        <p>Available since: <b>#{context[:since]}</b></p>
      EOHTML
    end

  end
end
