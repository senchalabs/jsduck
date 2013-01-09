require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class AlternateClassNames < ClassListTag
    def initialize
      @pattern = ["alternateClassName", "alternateClassNames"]
      @key = :alternateClassNames
      @ext_define_pattern = "alternateClassName"
      @ext_define_default = {:alternateClassNames => []}
    end
  end
end
