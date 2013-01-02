require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Author < Tag
    def initialize
      @pattern = "author"
    end

    # @author Name of Author <email@example.com> ...
    # Everything until the end of line gets just ignored.
    def parse(p)
      p.match(/.*$/)
    end
  end
end
