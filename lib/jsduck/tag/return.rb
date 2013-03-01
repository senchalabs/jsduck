require "jsduck/tag/tag"
require "jsduck/doc/subproperties"
require "jsduck/render/subproperties"

module JsDuck::Tag
  class Return < Tag
    def initialize
      @pattern = ["return", "returns"]
      @tagname = :return
      @html_position = POS_RETURN
    end

    # @return {Type} return.name ...
    def parse_doc(p, pos)
      tag = p.standard_tag({:tagname => :return, :type => true})
      tag[:name] = subproperty_name(p)
      tag[:doc] = :multiline
      tag
    end

    def subproperty_name(p)
      if p.hw.look(/return\.\w/)
        p.ident_chain
      else
        "return"
      end
    end

    def process_doc(h, tags, pos)
      ret = tags[0]
      h[:return] = {
        :type => ret[:type] || "Object",
        :name => ret[:name] || "return",
        :doc => ret[:doc] || "",
        :properties => JsDuck::Doc::Subproperties.nest(tags, pos)[0][:properties],
      }
    end

    def format(m, formatter)
      formatter.format_subproperty(m[:return])
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render_return(m[:return])
    end
  end
end
