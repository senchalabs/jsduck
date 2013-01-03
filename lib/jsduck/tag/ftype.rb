require "jsduck/tag/xtype"

module JsDuck::Tag
  class Ftype < Xtype
    def initialize
      @pattern = "ftype"
    end

    # @ftype name
    def parse(p)
      p.add_tag(:alias)
      parse_alias_shorthand(p, "feature")
    end

  end
end
