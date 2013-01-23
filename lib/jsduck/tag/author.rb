require "jsduck/tag/tag"

module JsDuck::Tag
  class Author < Tag
    def initialize
      @pattern = "author"
    end

    # @author Name of Author <email@example.com> ...
    # Everything until the end of line gets just ignored.
    def parse_doc(p)
      p.match(/.*$/)
    end
  end
end
