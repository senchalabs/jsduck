require "jsduck/tag/tag"

module JsDuck::Tag
  class Constructor < Tag
    def initialize
      @pattern = "constructor"
    end

    # @constructor
    def parse(p)
      p.add_tag(:constructor)
    end
  end
end
