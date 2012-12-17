require "jsduck/builtins/tag"

module JsDuck::Builtins
  # Implementation of @method tag.
  class Method < Tag
    def initialize
      @pattern = "method"
    end

    # @method name ...
    def parse(p)
      p.add_tag(:method)
      p.maybe_name
    end
  end
end
