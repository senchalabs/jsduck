require "jsduck/tag/xtype"

module JsDuck::Tag
  class Ptype < Xtype
    def initialize
      @pattern = "ptype"
    end

    # @ptype name
    def parse_doc(p, pos)
      {
        :tagname => :aliases,
        :name => parse_alias_shorthand(p, "plugin")
      }
    end

  end
end
