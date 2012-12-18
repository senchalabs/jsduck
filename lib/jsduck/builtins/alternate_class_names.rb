require "jsduck/builtins/tag"
require "jsduck/ast_utils"

module JsDuck::Builtins
  class AlternateClassNames < Tag
    def initialize
      @pattern = ["alternateClassName", "alternateClassNames"]
      @ext_define_pattern = "alternateClassName"
    end

    # @alternateClassNames classname1 classname2 ...
    def parse(p)
      p.add_tag(:alternateClassNames)
      p.classname_list(:alternateClassNames)
    end

    def parse_ext_define(cls, ast)
      cls[:alternateClassNames] = JsDuck::AstUtils.make_string_list(ast)
    end
  end
end
