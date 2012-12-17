require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Extends < Tag
    def initialize
      @pattern = ["extend", "extends"]
    end

    # @extends classname
    def parse(p)
      p.add_tag(:extends)
      p.maybe_ident_chain(:extends)
    end
  end
end
