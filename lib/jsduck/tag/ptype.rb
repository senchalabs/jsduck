require "jsduck/tag/xtype"

module JsDuck::Tag
  class Ptype < Xtype
    def initialize
      @pattern = "ptype"
    end

    # @ptype name
    def parse(p)
      {
        :tagname => :aliases,
        :name => parse_alias_shorthand(p, "plugin")
      }
    end

  end
end
