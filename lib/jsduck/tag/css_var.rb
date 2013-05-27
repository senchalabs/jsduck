require "jsduck/tag/member_tag"
require "jsduck/render/property_signature"

module JsDuck::Tag
  class CssVar < MemberTag
    def initialize
      @pattern = "var"
      @tagname = :css_var
      @member_type = {
        :title => "CSS Variables",
        :toolbar_title => "CSS Vars",
        :position => MEMBER_POS_CSS_VAR,
        :icon => File.dirname(__FILE__) + "/icons/css_var.png"
      }
    end

    # @var {Type} [name=default] ...
    def parse_doc(p, pos)
      p.standard_tag({
          :tagname => :css_var,
          :type => true,
          :name => true,
          :default => true,
          :optional => true
        })
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      h[:name] = p[:name]
      h[:type] = p[:type]
      h[:default] = p[:default]
    end

    def process_code(code)
      h = super(code)
      h[:type] = code[:type]
      h[:default] = code[:default]
      h
    end

    # Set default value for :type field
    def merge(h, docs, code)
      h[:type] = "Object" unless h[:type]
    end

    def to_html(var, cls)
      JsDuck::Render::PropertySignature.render(var)
    end
  end
end
