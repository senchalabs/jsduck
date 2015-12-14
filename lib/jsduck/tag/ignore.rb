require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  # Causes a member or entire class documentation to be completely
  # excluded from docs.
  class Ignore < BooleanTag
    def initialize
      @pattern = "ignore"
      super
    end
  end
end
