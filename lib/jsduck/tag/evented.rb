require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Evented < BooleanTag
    def initialize
      @pattern = "evented"
      super
    end
  end
end
