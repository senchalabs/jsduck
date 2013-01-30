require "jsduck/tag/tag"
require "jsduck/render/subproperties"

module JsDuck::Tag
  class Throws < Tag
    def initialize
      @pattern = "throws"
      @key = :throws
      @html_position = POS_THROWS
    end

    # @throws {Type} ...
    def parse_doc(p)
      tag = p.standard_tag({:tagname => :throws, :type => true})
      tag[:doc] = :multiline
      tag
    end

    def process_doc(h, tags, pos)
      result = tags.map do |throws|
        {
          :type => throws[:type] || "Object",
          :doc => throws[:doc] || "",
        }
      end

      h[:throws] = result
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render_throws(m[:throws])
    end
  end
end
