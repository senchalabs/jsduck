require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
    end

    # @class name
    def parse(p)
      {
        :tagname => :class,
        :name => p.hw.ident_chain,
      }
    end
  end
end
