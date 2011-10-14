require "jsduck/meta_tag"

module JsDuck
  # Implementation of hidden @author tag
  class AuthorTag < MetaTag
    def initialize
      @name = "author"
    end
  end
end

