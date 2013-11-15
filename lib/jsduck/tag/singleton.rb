require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Singleton < BooleanTag
    def initialize
      @pattern = "singleton"
      @ext_define_pattern = "singleton"
      @class_icon = {
        :small => File.dirname(__FILE__) + "/icons/singleton.png",
        :large => File.dirname(__FILE__) + "/icons/singleton-large.png",
        :redirect => File.dirname(__FILE__) + "/icons/singleton-redirect.png",
      }
      super
    end

    def parse_ext_define(cls, ast)
      cls[:singleton] = (ast.to_value == true)
    end
  end
end
