require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Inheritable < BooleanTag
    def initialize
      @key = :inheritable
      super
    end
  end
end
