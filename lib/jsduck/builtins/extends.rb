require "jsduck/builtins/tag"
require "jsduck/ast_utils"

module JsDuck::Builtins
  class Extends < Tag
    def initialize
      @pattern = ["extend", "extends"]
      @ext_define_pattern = "extend"
      @ext_define_default = {:extends => "Ext.Base"}
    end

    # @extends classname
    def parse(p)
      p.add_tag(:extends)
      p.maybe_ident_chain(:extends)
    end

    def parse_ext_define(cls, ast)
      cls[:extends] = JsDuck::AstUtils.make_string(ast)
    end
  end
end
