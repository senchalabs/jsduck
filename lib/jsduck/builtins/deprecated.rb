require "jsduck/builtins/deprecated_tag"

module JsDuck::Builtins
  class Deprecated < DeprecatedTag
    def initialize
      @key = :deprecated
      super
    end
  end
end
