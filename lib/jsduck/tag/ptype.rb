require "jsduck/tag/xtype"

module JsDuck::Tag
  class Ptype < Xtype
    def initialize
      @pattern = "ptype"
    end

    # @ptype name
    def parse(p)
      p.add_tag(:alias)
      parse_alias_shorthand(p, "plugin")
    end

  end
end
