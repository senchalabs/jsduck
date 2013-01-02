require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Chainable < BooleanTag
    def initialize
      @key = :chainable
      @signature = {:long => "chainable", :short => "&gt;"} # show small right-arrow
      super
    end
  end
end
