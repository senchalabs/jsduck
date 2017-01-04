require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @deprecated tag
  class Deprecated < JsDuck::MetaTag
    def initialize
      @name = "deprecated"
      @key = :deprecated
      @signature = {:long => "deprecated", :short => "DEP"}
      @multiline = true
      @position = :custom
    end

    def to_value(contents)
      text = contents[0]
      if text =~ /\A([0-9.]+)(.*)\Z/
        {:version => $1, :text => $2.strip}
      else
        {:text => text || ""}
      end
    end

    def to_html(depr)
      v = depr[:version] ? " since " + depr[:version] : ""
      <<-EOHTML
        <div class='signature-box deprecated'>
        <p><strong>deprecated</strong>#{v} #{format(depr[:text])}</p>
        </div>
      EOHTML
    end
  end
end

