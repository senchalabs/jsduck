require "jsduck/tag/tag"
require "jsduck/doc/subproperties"
require "jsduck/render/subproperties"

module JsDuck::Tag
  class Param < Tag
    def initialize
      @pattern = "param"
      @tagname = :params
      @repeatable = true
      @html_position = POS_PARAM
    end

    # @param {Type} [name=default] (optional) ...
    def parse_doc(p, pos)
      tag = p.standard_tag({
          :tagname => :params,
          :type => true,
          :name => true,
          :default => true,
          :optional => true
        })
      tag[:optional] = true if parse_optional(p)
      tag[:doc] = :multiline
      tag
    end

    def parse_optional(p)
      p.hw.match(/\(optional\)/i)
    end

    def process_doc(h, tags, pos)
      h[:params] = JsDuck::Doc::Subproperties.nest(tags, pos)
      h[:params] = nil if h[:params].length == 0
    end

    def format(m, formatter)
      m[:params].each {|p| formatter.format_subproperty(p) }
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render_params(m[:params]) if m[:params].length > 0
    end

  end
end
