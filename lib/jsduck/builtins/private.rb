require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Private < BooleanTag
    def initialize
      @key = :private
      @signature = {:long => "private", :short => "PRI"}
      super
    end
  end
end
