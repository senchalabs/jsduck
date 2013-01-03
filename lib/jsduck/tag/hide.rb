require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  # Hides a member in parent class.
  class Hide < BooleanTag
    def initialize
      @key = :hide
      super
    end
  end
end
