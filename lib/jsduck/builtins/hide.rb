require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  # Hides a member in parent class.
  class Hide < BooleanTag
    def initialize
      @key = :hide
      super
    end
  end
end
