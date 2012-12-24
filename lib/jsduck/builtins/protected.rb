require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Protected < BooleanTag
    def initialize
      @key = :protected
      @signature = {:long => "protected", :short => "PRO"}
      super
    end
    # When the tag is found, its value will always be true.
    def process_doc(docs)
      true
    end
  end
end
