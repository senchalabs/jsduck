require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  class Deprecated < DeprecatedTag
    def initialize
      @tagname = :deprecated
      @msg = "This {TAGNAME} has been <strong>deprected</strong>"
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
    end
  end
end
