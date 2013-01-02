require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Chainable < BooleanTag
    def initialize
      @key = :chainable
      @signature = {:long => "chainable", :short => "&gt;"} # show small right-arrow
      super
    end
    # When the tag is found, its value will always be true.
    def process_doc(docs)
      true
    end
  end
end
