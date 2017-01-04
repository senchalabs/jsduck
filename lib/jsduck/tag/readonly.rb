require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @readonly tag
  class Readonly < JsDuck::MetaTag
    def initialize
      @name = "readonly"
      @key = :readonly
      @signature = {:long => "readonly", :short => "R O"}
      @boolean = true
    end
  end
end

