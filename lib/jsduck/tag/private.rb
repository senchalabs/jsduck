require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Private < BooleanTag
    def initialize
      @key = :private
      @signature = {:long => "private", :short => "PRI"}
      super
    end
  end
end
