require "jsduck/tag/tag"

module JsDuck::Tag
  class CssVar < Tag
    def initialize
      @pattern = "var"
      @member_type = :css_var
    end

    # @var {Type} [name=default] ...
    def parse(p)
      p.add_tag(:css_var)
      p.maybe_type
      p.maybe_name_with_default
    end
  end
end
