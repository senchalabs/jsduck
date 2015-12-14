require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  class Deprecated < DeprecatedTag
    def initialize
<<<<<<< HEAD
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
=======
      @tagname = :deprecated
      @msg = "This {TAGNAME} has been <strong>deprecated</strong>"
      @css = <<-EOCSS
        .signature .deprecated {
          background-color: #aa0000;
        }
        .deprecated-box {
          border: 2px solid #aa0000;
        }
        .deprecated-box strong {
          color: white;
          background-color: #aa0000;
        }
      EOCSS
      super
>>>>>>> senchalabs/master
    end
  end
end
