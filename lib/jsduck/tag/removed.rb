require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @removed tag.
  #
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like @deprecated.
  class Removed < JsDuck::MetaTag
    def initialize
      @name = "removed"
      @key = :removed
      @signature = {:long => "removed", :short => "REM"}
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

    def to_html(val)
      ver = val[:version] ? "since " + val[:version] : ""
      <<-EOHTML
        <div class='signature-box removed'>
        <p>This #{@context[:tagname]} has been <strong>removed</strong> #{ver}</p>
        #{format(val[:text])}
        </div>
      EOHTML
    end
  end
end

