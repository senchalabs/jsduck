require "jsduck/tag/tag"
require "jsduck/ast_utils"

module JsDuck::Tag
  class Uses < Tag
    def initialize
      @pattern = "uses"
      @ext_define_pattern = "uses"
      @ext_define_default = {:uses => []}
    end

    # @uses classname1 classname2 ...
    def parse(p)
      p.add_tag(:uses)
      p.classname_list(:uses)
    end

    def parse_ext_define(cls, ast)
      cls[:uses] = JsDuck::AstUtils.make_string_list(ast)
    end
  end
end
