require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Throws < Tag
    def initialize
      @pattern = "throws"
    end

    # @throws {Type} ...
    def parse(p)
      p.add_tag(:throws)
      p.maybe_type
    end
  end
end
