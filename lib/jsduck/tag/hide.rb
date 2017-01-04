require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @hide tag.
  #
  # Hides a member in parent class.
  #
  # The core of the implementation is built into jsduck.
  #
  class Hide < JsDuck::MetaTag
    def initialize
      @name = "hide"
      @key = :hide
      @boolean = true
    end
  end
end
