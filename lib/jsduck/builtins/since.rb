require "jsduck/builtins/tag"
require "jsduck/logger"

module JsDuck::Builtins
  class Since < Tag
    def initialize
      @pattern = "since"
      @key = :since
      @html_position = :bottom
    end

    def parse(p)
      p.add_tag(:since)
      p.skip_horiz_white
      p.current_tag[:version] = p.match(/.*$/).strip
    end

    def process_doc(tags)
      if tags.length > 1
        JsDuck::Logger.warn(nil, "Only one @since tag allowed per class/member.")
      end
      tags[0][:version]
    end

    def to_html(context)
      <<-EOHTML
        <p>Available since: <b>#{context[:since]}</b></p>
      EOHTML
    end

  end
end
