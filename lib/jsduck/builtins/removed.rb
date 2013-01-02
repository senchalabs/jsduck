require "jsduck/builtins/deprecated_tag"

module JsDuck::Builtins
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like
  # @deprecated.
  class Removed < DeprecatedTag
    def initialize
      @key = :removed
      super
    end
  end
end
