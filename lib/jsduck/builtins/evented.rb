require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Evented < Tag
    def initialize
      @pattern = "evented"
    end

    # @evented
    def parse(p)
      p.add_tag(:evented)
    end
  end
end
