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
        :name => p.hw && p.ident_chain,
        :doc => "",
      }
    end
  end
end
