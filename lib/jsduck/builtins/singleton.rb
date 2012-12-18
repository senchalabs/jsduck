require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Singleton < Tag
    def initialize
      @pattern = "singleton"
      @ext_define_pattern = "singleton"
    end

    # @singleton
    def parse(p)
      p.add_tag(:singleton)
    end

    def parse_ext_define(cls, ast)
      cls[:singleton] = (ast.to_value == true)
    end
  end
end
