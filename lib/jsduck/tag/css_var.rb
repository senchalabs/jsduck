require "jsduck/tag/tag"

module JsDuck::Tag
  class CssVar < Tag
    def initialize
      @pattern = "var"
      @key = :css_var
      @member_type = :css_var
    end

    # @var {Type} [name=default] ...
    def parse_doc(p)
      p.standard_tag({:tagname => :css_var, :type => true, :name => true})
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      h[:name] = p[:name]
      h[:type] = p[:type]
      h[:default] = p[:default]
    end
  end
end
