require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Inheritable < Tag
    def initialize
      @pattern = "inheritable"
      @key = :inheritable
    end

    # @inheritable
    def parse(p)
      p.add_tag(:inheritable)
    end

    def process_doc(docs)
      true
    end
  end
end
