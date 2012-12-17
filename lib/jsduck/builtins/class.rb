require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Class < Tag
    def initialize
      @pattern = "class"
    end

    # @class name
    def parse(p)
      p.add_tag(:class)
      p.maybe_ident_chain(:name)
    end
  end
end
