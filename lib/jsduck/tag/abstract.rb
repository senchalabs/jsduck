require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @abstract tag
  class Abstract < JsDuck::MetaTag
    def initialize
      @name = "abstract"
      @key = :abstract
      @signature = {:long => "abstract", :short => "ABS"}
      @boolean = true
    end
  end
end

