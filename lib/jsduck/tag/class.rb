require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
      @key = :class
    end

    # @class name
    def parse_doc(p)
      {
        :tagname => :class,
        :name => p.hw.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end
  end
end
