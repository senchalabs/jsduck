require "jsduck/tag/tag"

module JsDuck::Tag
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
