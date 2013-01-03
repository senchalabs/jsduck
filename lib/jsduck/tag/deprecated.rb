require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  class Deprecated < DeprecatedTag
    def initialize
      @key = :deprecated
      super
    end
  end
end
