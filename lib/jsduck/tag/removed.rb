require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like
  # @deprecated.
  class Removed < DeprecatedTag
    def initialize
<<<<<<< HEAD
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
=======
      @tagname = :removed
      @msg = "This {TAGNAME} has been <strong>removed</strong>"
      # striked-through text with red border.
      @css = <<-EOCSS
        .signature .removed {
          color: #aa0000;
          background-color: transparent;
          border: 1px solid #aa0000;
          text-decoration: line-through;
        }
        .removed-box {
          border: 2px solid #aa0000;
        }
        .removed-box strong {
          color: #aa0000;
          border: 2px solid #aa0000;
          background-color: transparent;
          text-decoration: line-through;
        }
      EOCSS
      super
>>>>>>> senchalabs/master
    end
  end
end
