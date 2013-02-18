require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Protected < BooleanTag
    def initialize
      @pattern = "protected"
      @signature = {:long => "protected", :short => "PRO"}
      @css = ".signature .protected { background-color: #9B86FC }" # Violet
      super
    end
  end
end
