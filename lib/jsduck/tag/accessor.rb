require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Accessor < BooleanTag
    def initialize
      @key = :accessor
      super
    end
  end
end
