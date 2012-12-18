require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Type < Tag
    def initialize
      @pattern = "type"
    end

    # matches @type {type}  or  @type type
    #
    # The presence of @type implies that we are dealing with property.
    # ext-doc allows type name to be either inside curly braces or
    # without them at all.
    def parse(p)
      p.add_tag(:type)
      p.maybe_type
      maybe_curlyless_type(p) unless p.current_tag[:type]
    end

    def maybe_curlyless_type(p)
      if p.look(/\S/)
        p.current_tag[:type] = p.match(/\S+/)
      end
    end

  end
end
