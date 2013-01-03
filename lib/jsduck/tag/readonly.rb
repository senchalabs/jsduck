require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Readonly < BooleanTag
    def initialize
      @key = :readonly
      @signature = {:long => "readonly", :short => "R O"}
      super
    end
  end
end
