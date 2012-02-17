require "jsduck/meta_tag"

module JsDuck::Tag
  # @ignore is alias for @private
  class Ignore < JsDuck::MetaTag
    def initialize
      @name = "ignore"
      @key = :ignore
      @boolean = true
    end
  end
end

