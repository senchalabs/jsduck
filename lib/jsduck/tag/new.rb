require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  # Implementation of @new tag.
  class New < JsDuck::MetaTag
    def initialize
      @name = "new"
      @key = :new
      @signature = {:long => "&#9733;", :short => "&#9733;"} # unicode black star char
      @boolean = true
    end

    def to_value(contents)
      true
    end

  end
end

