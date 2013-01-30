require "jsduck/tag/tag"
require "jsduck/doc/subproperties"
require "jsduck/render/subproperties"
require "jsduck/docs_code_comparer"

module JsDuck::Tag
  class Param < Tag
    def initialize
      @pattern = "param"
      @key = :params
      @merge_context = [:method, :event, :css_mixin]
      @html_position = POS_PARAMS
    end

    # @param {Type} [name=default] (optional) ...
    def parse_doc(p)
      tag = p.standard_tag({:tagname => :params, :type => true, :name => true})
      tag[:optional] = true if parse_optional(p)
      tag[:doc] = :multiline
      tag
    end

    def parse_optional(p)
      p.hw.match(/\(optional\)/i)
    end

    def process_doc(h, tags, pos)
      h[:params] = JsDuck::Doc::Subproperties.nest(tags, pos)
    end

    def merge(h, docs, code)
      h[:params] = merge_params(docs, code)
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render_params(m[:params]) if m[:params].length > 0
    end

    private

    def merge_params(docs, code)
      explicit = docs[:params] || []
      implicit = JsDuck::DocsCodeComparer.matches?(docs, code) ? (code[:params] || []) : []
      # Override implicit parameters with explicit ones
      # But if explicit ones exist, don't append the implicit ones.
      params = []
      (explicit.length > 0 ? explicit.length : implicit.length).times do |i|
        im = implicit[i] || {}
        ex = explicit[i] || {}
        params << {
          :type => ex[:type] || im[:type] || "Object",
          :name => ex[:name] || im[:name] || "",
          :doc => ex[:doc] || im[:doc] || "",
          :optional => ex[:optional] || false,
          :default => ex[:default],
          :properties => ex[:properties] || [],
        }
      end
      params
    end

  end
end
