require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @writeonly tag
  class Writeonly < JsDuck::MetaTag
    def initialize
      @name = "writeonly"
      @key = :writeonly
      @signature = {:long => "writeonly", :short => "W O"}
      @boolean = true
    end
  end
end