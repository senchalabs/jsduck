require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class Uses < ClassListTag
    def initialize
      @pattern = "uses"
      @key = :uses
      @ext_define_pattern = "uses"
      @ext_define_default = {:uses => []}
    end
  end
end
