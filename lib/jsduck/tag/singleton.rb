require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Singleton < BooleanTag
    def initialize
      @pattern = "singleton"
      @ext_define_pattern = "singleton"
      @class_icon = "icon-singleton"
      super
    end

    def parse_ext_define(cls, ast)
      cls[:singleton] = (ast.to_value == true)
    end
  end
end
