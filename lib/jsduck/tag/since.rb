require "jsduck/tag/tag"
require "jsduck/logger"

module JsDuck::Tag
  class Since < Tag
    def initialize
      @pattern = "since"
      @key = :since
      @html_position = :bottom
    end

    def parse(p)
      {
        :tagname => :since,
        :version => p.hw.match(/.*$/).strip,
      }
    end

    def process_doc(h, tags)
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
