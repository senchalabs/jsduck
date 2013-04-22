require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class AlternateClassNames < ClassListTag
    def initialize
      @pattern = ["alternateClassName", "alternateClassNames"]
      @tagname = :alternateClassNames
      @repeatable = true
      @ext_define_pattern = "alternateClassName"
      @ext_define_default = {:alternateClassNames => []}
      @merge_context = :class
    end

    def merge(h, docs, code)
      h[@tagname] = [] unless h[@tagname]
    end
  end
end
