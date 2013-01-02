require "jsduck/builtins/author"

module JsDuck::Builtins
  # Exactly the same as @author tag - it's simply ignored.
  class Docauthor < Author
    def initialize
      @pattern = "docauthor"
    end
  end
end
