require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of hidden @docauthor tag
  class Docauthor < JsDuck::MetaTag
    def initialize
      @name = "docauthor"
    end
  end
end

