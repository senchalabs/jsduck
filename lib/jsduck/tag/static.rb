require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @static tag
  class Static < JsDuck::MetaTag
    def initialize
      @name = "static"
      @key = :static
      @signature = {:long => "static", :short => "STA"}
      @boolean = true
    end
  end
end

