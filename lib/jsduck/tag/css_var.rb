require "jsduck/tag/member_tag"
require "jsduck/render/property_signature"

module JsDuck::Tag
  class CssVar < MemberTag
    def initialize
      @pattern = "var"
      @tagname = :css_var
      @member_type = {
        :name => :css_var,
        :category => :property_like,
        :title => "CSS Variables",
        :toolbar_title => "CSS Vars",
        :position => MEMBER_POS_CSS_VAR,
      }
    end

    # @var {Type} [name=default] ...
    def parse_doc(p, pos)
      p.standard_tag({:tagname => :css_var, :type => true, :name => true})
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      h[:name] = p[:name]
      h[:type] = p[:type]
      h[:default] = p[:default]
    end

    def to_html(var, cls)
      JsDuck::Render::PropertySignature.render(var)
    end
  end
end
