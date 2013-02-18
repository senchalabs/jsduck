require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like
  # @deprecated.
  class Removed < DeprecatedTag
    def initialize
      @tagname = :removed
      super
    end
  end
end
