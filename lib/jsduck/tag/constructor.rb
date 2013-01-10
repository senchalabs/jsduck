require "jsduck/tag/tag"

module JsDuck::Tag
  class Constructor < Tag
    def initialize
      @pattern = "constructor"
    end

    # @constructor
    def parse(p)
      {:tagname => :constructor}
    end
  end
end
