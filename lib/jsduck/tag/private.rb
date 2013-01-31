require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Private < BooleanTag
    def initialize
      @key = :private
      @signature = {:long => "private", :short => "PRI"}
      @html_position = POS_PRIVATE
      super
    end

    # Add notice to private classes
    def to_html(context)
      return unless context[:tagname] == :class

      return [
        "<p class='private'><strong>NOTE</strong> ",
        "This is a private utility class for internal use by the framework. ",
        "Don't rely on its existence.</p>",
      ]
    end
  end
end
