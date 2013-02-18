require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class Requires < ClassListTag
    def initialize
      @pattern = "requires"
      @tagname = :requires
      @ext_define_pattern = "requires"
      @ext_define_default = {:requires => []}
    end
  end
end
