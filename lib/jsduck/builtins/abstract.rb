require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Abstract < BooleanTag
    def initialize
      @key = :abstract
      @signature = {:long => "abstract", :short => "ABS"}
      super
    end
  end
end
