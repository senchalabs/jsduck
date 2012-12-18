require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Enum < Tag
    def initialize
      @pattern = "enum"
    end

    # @enum {Type} [name=default] ...
    def parse(p)
      # @enum is a special case of class
      p.add_tag(:class)
      p.current_tag[:enum] = true
      p.maybe_type
      p.maybe_name_with_default
    end

  end
end
