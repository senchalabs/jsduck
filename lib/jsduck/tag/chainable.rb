require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Chainable < BooleanTag
    def initialize
      @pattern = "chainable"
      @signature = {:long => "chainable", :short => "&gt;"} # show small right-arrow
      super
    end
  end
end
