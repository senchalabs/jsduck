require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Readonly < BooleanTag
    def initialize
      @key = :readonly
      @signature = {:long => "readonly", :short => "R O"}
      super
    end
  end
end
