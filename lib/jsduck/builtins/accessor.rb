require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Accessor < Tag
    def initialize
      @pattern = "accessor"
    end

    # @accessor
    def parse(p)
      p.add_tag(:accessor)
    end
  end
end
