require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of hidden @author tag
  class Author < JsDuck::MetaTag
    def initialize
      @name = "author"
    end
  end
end

