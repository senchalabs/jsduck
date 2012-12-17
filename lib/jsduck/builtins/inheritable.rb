require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Inheritable < Tag
    def initialize
      @pattern = "inheritable"
    end

    # @inheritable
    def parse(p)
      p.add_tag(:inheritable)
    end
  end
end
