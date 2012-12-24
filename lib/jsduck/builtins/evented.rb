require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Evented < BooleanTag
    def initialize
      @key = :evented
      super
    end
  end
end
