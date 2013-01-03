require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Static < BooleanTag
    def initialize
      @key = :static
      @signature = {:long => "static", :short => "STA"}
      super
    end
  end
end
