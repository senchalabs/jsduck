require "jsduck/meta_tag"

module JsDuck::Tag
  # A @markdown tag that is simply ignored
  class Markdown < JsDuck::MetaTag
    def initialize
      @name = "markdown"
      @boolean = true
    end
  end
end

