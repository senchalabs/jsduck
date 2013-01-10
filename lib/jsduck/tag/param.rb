require "jsduck/tag/tag"

module JsDuck::Tag
  class Param < Tag
    def initialize
      @pattern = "param"
    end

    # @param {Type} [name=default] (optional) ...
    def parse(p)
      p.add_tag(:param)
      p.maybe_type
      p.maybe_name_with_default
      p.current_tag[:optional] = true if parse_optional(p)
    end

    def parse_optional(p)
      p.hw.match(/\(optional\)/i)
    end
  end
end
