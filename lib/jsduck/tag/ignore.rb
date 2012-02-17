require "jsduck/meta_tag"

module JsDuck::Tag
  # @ignore is alias for @private
  class Ignore < JsDuck::MetaTag
    def initialize
      @name = "ignore"
      @key = :private
      @boolean = true
    end
  end
end

