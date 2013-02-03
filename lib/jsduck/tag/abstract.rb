require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Abstract < BooleanTag
    def initialize
      @pattern = "abstract"
      @signature = {:long => "abstract", :short => "ABS"}
      super
    end
  end
end
