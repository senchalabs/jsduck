require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  class Experimental < DeprecatedTag
    def initialize
      @tagname = :experimental
      @msg = "This {TAGNAME} is <strong>experimental</strong>"
      @since = "Introduced in"
      # dashed border
      @css = <<-EOCSS
        .signature .experimental {
          color: #a00;
          border: 1px dashed #a00;
          background-color: #fee;
        }
        .experimental-box {
          border: 2px dashed #ccc;
        }
        .experimental-box strong {
          margin: 0 3px;
          border: 2px dashed #a00;
          color: #a00;
        }
      EOCSS
      super
    end
  end
end
