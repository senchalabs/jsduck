require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class Uses < ClassListTag
    def initialize
      @pattern = "uses"
      @tagname = :uses
      @repeatable = true
      @ext_define_pattern = "uses"
      @ext_define_default = {:uses => []}
    end
  end
end
