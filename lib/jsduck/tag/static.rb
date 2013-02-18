require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Static < BooleanTag
    def initialize
      @pattern = "static"
      @signature = {:long => "static", :short => "STA"}
      @css = ".signature .static { background-color: #484848 }" # Docs text color
      super
    end
  end
end
