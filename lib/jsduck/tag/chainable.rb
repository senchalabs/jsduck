require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Chainable < BooleanTag
    def initialize
      @pattern = "chainable"
      @signature = {:long => "chainable", :short => "&gt;"} # show small right-arrow
      @css = ".signature .chainable { background-color: #00aa00 }" # green
      super
    end
  end
end
