require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Param < Tag
    def initialize
      @pattern = "param"
    end

    # @param {Type} [name=default] (optional) ...
    def parse(p)
      p.add_tag(:param)
      p.maybe_type
      p.maybe_name_with_default
      p.maybe_optional
    end
  end
end
