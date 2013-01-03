require "jsduck/tag/tag"

module JsDuck::Tag
  class Return < Tag
    def initialize
      @pattern = ["return", "returns"]
    end

    # @return {Type} return.name ...
    def parse(p)
      p.add_tag(:return)
      p.maybe_type
      maybe_object_property(p)
    end

    def maybe_object_property(p)
      p.skip_horiz_white
      if p.look(/return\.\w/)
        p.current_tag[:name] = p.ident_chain
      else
        p.current_tag[:name] = "return"
      end
    end
  end
end
