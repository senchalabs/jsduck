require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  # Causes a member or entire class documentation to be completely
  # excluded from docs.
  class Ignore < BooleanTag
    def initialize
      @key = :ignore
      super
    end
  end
end
