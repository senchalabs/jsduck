require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
      @tagname = :class
      @merge_context = :class
    end

    # @class name
    def parse_doc(p, pos)
      {
        :tagname => :class,
        :name => p.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end

    # Ensure the empty members array.
    def merge(h, docs, code)
      h[:members] = []
    end
  end
end
