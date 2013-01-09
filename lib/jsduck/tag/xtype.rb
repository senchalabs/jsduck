require "jsduck/tag/tag"
require "jsduck/ast_utils"

module JsDuck::Tag
  class Xtype < Tag
    def initialize
      @pattern = "xtype"
      @ext_define_pattern = "xtype"
    end

    # @xtype name
    def parse(p)
      p.add_tag(:aliases)
      parse_alias_shorthand(p, "widget")
    end

    # Parses the name after @ftype, @xtype or @ptype
    # and saves it with the given namespace prefix.
    def parse_alias_shorthand(p, namespace)
      p.skip_horiz_white
      p.current_tag[:name] = namespace + "." + (p.ident_chain || "")
    end

    def parse_ext_define(cls, ast)
      cls[:aliases] += JsDuck::AstUtils.make_string_list(ast).map {|xtype| "widget."+xtype }
    end

  end
end
