require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Protected < BooleanTag
    def initialize
      @key = :protected
      @signature = {:long => "protected", :short => "PRO"}
      super
    end
  end
end
