require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Accessor < BooleanTag
    def initialize
      @key = :accessor
      super
    end
  end
end
