require "jsduck/tag/xtype"

module JsDuck::Tag
  class Ftype < Xtype
    def initialize
      @pattern = "ftype"
      @repeatable = true
    end

    # @ftype name
    def parse_doc(p, pos)
      {
        :tagname => :aliases,
        :name => parse_alias_shorthand(p, "feature")
      }
    end

  end
end
