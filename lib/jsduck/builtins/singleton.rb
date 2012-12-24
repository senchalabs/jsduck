require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Singleton < BooleanTag
    def initialize
      @key = :singleton
      @ext_define_pattern = "singleton"
      super
    end

    def parse_ext_define(cls, ast)
      cls[:singleton] = (ast.to_value == true)
    end
  end
end
