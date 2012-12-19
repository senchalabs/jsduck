require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Markdown < Tag
    def initialize
      @pattern = "markdown"
    end

    # @markdown
    def parse(p)
      # Just completely ignore this tag.
    end
  end
end
