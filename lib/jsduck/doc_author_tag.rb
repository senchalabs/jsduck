require "jsduck/meta_tag"

module JsDuck
  # Implementation of hidden @docauthor tag
  class DocAuthorTag < MetaTag
    def initialize
      @name = "docauthor"
    end
  end
end

