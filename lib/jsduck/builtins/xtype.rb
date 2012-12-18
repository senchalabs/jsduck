require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Xtype < Tag
    def initialize
      @pattern = "xtype"
    end

    # @xtype name
    def parse(p)
      p.add_tag(:alias)
      parse_alias_shorthand(p, "widget")
    end

    # Parses the name after @ftype, @xtype or @ptype
    # and saves it with the given namespace prefix.
    def parse_alias_shorthand(p, namespace)
      p.skip_horiz_white
      p.current_tag[:name] = namespace + "." + (p.ident_chain || "")
    end

  end
end
