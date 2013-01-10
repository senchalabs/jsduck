require "jsduck/tag/tag"

module JsDuck::Tag
  class CssVar < Tag
    def initialize
      @pattern = "var"
      @member_type = :css_var
    end

    # @var {Type} [name=default] ...
    def parse(p)
      p.standard_tag({:tagname => :css_var})
    end
  end
end
