require "jsduck/tag/tag"
require "jsduck/doc/subproperties"
require "jsduck/render/subproperties"
require "jsduck/logger"
require "jsduck/merger"

module JsDuck::Tag
  class Param < Tag
    def initialize
      @pattern = "param"
      @tagname = :params
      @repeatable = true
      @merge_context = :method_like
      @html_position = POS_PARAM
    end

    # @param {Type} [name=default] (optional) ...
    def parse_doc(p, pos)
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
      h[:params] = nil if h[:params].length == 0
    end

    def merge(h, docs, code)
      # Ensure the existance of params array.
      h[:params] = [] unless h[:params]
      # Default type of each parameter to "Object"
      h[:params].each do |p|
        p[:type] = "Object" unless p[:type]
      end

      check_consistency(docs, code, h[:files].first)
    end

    def format(m, formatter)
      m[:params].each {|p| formatter.format_subproperty(p) }
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render_params(m[:params]) if m[:params].length > 0
    end

    private

    def check_consistency(docs, code, file)
      explicit = docs[:params] || []
      implicit = JsDuck::Merger.can_be_autodetected?(docs, code) ? (code[:params] || []) : []
      ex_len = explicit.length
      im_len = implicit.length

      if ex_len == 0 || im_len == 0
        # Skip when either no implicit or explicit params
      elsif ex_len != im_len && explicit.last[:type] =~ /\.\.\.$/
        # Skip when vararg params are in play.
      elsif ex_len < im_len
        # Warn when less parameters documented than found from code.
        JsDuck::Logger.warn(:param_count, "Detected #{im_len} params, but only #{ex_len} documented.", file)
      elsif ex_len > im_len
        # Warn when more parameters documented than found from code.
        JsDuck::Logger.warn(:param_count, "Detected #{im_len} params, but #{ex_len} documented.", file)
      elsif implicit.map {|p| p[:name] } != explicit.map {|p| p[:name] }
        # Warn when parameter names don't match up.
        ex_names = explicit.map {|p| p[:name] }
        im_names = implicit.map {|p| p[:name] }
        str = ex_names.zip(im_names).map {|p| ex, im = p; ex == im ? ex : (ex||"")+"/"+(im||"") }.join(", ")
        JsDuck::Logger.warn(:param_count, "Documented and auto-detected params don't match: #{str}", file)
      end
    end

  end
end
