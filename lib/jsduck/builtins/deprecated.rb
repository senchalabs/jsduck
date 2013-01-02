require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Deprecated < Tag
    def initialize
      @pattern = "deprecated"
      @key = :deprecated
      @signature = {:long => "deprecated", :short => "DEP"}
      @html_position = :bottom
      @multiline = true
    end

    def parse(p)
      p.add_tag(:deprecated)
      p.skip_horiz_white
      p.current_tag[:version] = p.match(/[0-9.]+/) if p.look(/[0-9]/)
    end

    def process_doc(tags)
      v = {:text => tags[0][:doc] || ""}
      v[:version] = tags[0][:version] if tags[0][:version]
      v
    end

    def to_html(context)
      depr = context[:deprecated]
      v = depr[:version] ? "since " + depr[:version] : ""
      <<-EOHTML
        <div class='signature-box deprecated'>
        <p>This #{context[:tagname]} has been <strong>deprecated</strong> #{v}</p>
        #{format(depr[:text])}
        </div>
      EOHTML
    end

  end
end
