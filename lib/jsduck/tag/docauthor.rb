require "jsduck/tag/author"

module JsDuck::Tag
  # Exactly the same as @author tag - it's simply ignored.
  class Docauthor < Author
    def initialize
      super
      @pattern = "docauthor"
      @tagname = :docauthor
    end
  end
end
