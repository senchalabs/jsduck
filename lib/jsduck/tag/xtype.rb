require "jsduck/tag/tag"
require "jsduck/js/utils"

module JsDuck::Tag
  class Xtype < Tag
    def initialize
      @pattern = "xtype"
      @ext_define_pattern = "xtype"
      @repeatable = true
    end

    # @xtype name
    def parse_doc(p, pos)
      {
        :tagname => :aliases,
        :name => parse_alias_shorthand(p, "widget")
      }
    end

    # Parses the name after @ftype, @xtype or @ptype
    # and returns it with the given namespace prefix.
    def parse_alias_shorthand(p, namespace)
      namespace + "." + (p.ident_chain || "")
    end

    def parse_ext_define(cls, ast)
      cls[:aliases] += JsDuck::Js::Utils.make_string_list(ast).map {|xtype| "widget."+xtype }
    end

  end
end
