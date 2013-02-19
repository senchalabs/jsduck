require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Private < BooleanTag
    def initialize
      @pattern = "private"
      @signature = {:long => "private", :short => "PRI"}
      @html_position = POS_PRIVATE
      @css = <<-EOCSS
        .signature .private {
          background-color: #FD6B1B; /* orange */
        }
        .private-box {
          background-color: #fee;
          text-align: center;
          color: #600;
          margin-bottom: 1em;
        }
      EOCSS
      super
    end

    # Add notice to private classes
    def to_html(context)
      return unless context[:tagname] == :class

      return [
        "<div class='rounded-box private-box'>",
        "<p><strong>NOTE:</strong> This is a private utility class for internal use ",
        "by the framework. Don't rely on its existence.</p>",
        "</div>",
      ]
    end
  end
end
