require "jsduck/tag/tag"

module JsDuck::Tag
  class Markdown < Tag
    def initialize
      @pattern = "markdown"
    end

    # @markdown
    def parse_doc(p, pos)
      # Just completely ignore this tag.
    end
  end
end
