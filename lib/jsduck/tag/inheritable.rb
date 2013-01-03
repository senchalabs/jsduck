require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Inheritable < BooleanTag
    def initialize
      @key = :inheritable
      super
    end
  end
end
