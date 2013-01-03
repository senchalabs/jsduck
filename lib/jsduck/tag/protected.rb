require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Protected < BooleanTag
    def initialize
      @key = :protected
      @signature = {:long => "protected", :short => "PRO"}
      super
    end
  end
end
