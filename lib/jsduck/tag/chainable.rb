require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @chainable tag
  class Chainable < JsDuck::MetaTag
    def initialize
      @name = "chainable"
      @key = :chainable
      @signature = {:long => "chainable", :short => "&gt;"} # show small right-arrow
      @boolean = true
    end
  end
end

