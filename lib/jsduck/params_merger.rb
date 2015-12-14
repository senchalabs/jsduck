require "jsduck/logger"
require "jsduck/merger"

module JsDuck
  # Performs the merging of :params field.
  # Used by Method, Event and CssMixin members.
  class ParamsMerger
    # Ensures the existance of params array.
    # Defaults type of each parameter to "Object".
    # Logs warnings for inconsistencies between params in code and in docs.
    def self.merge(h, docs, code)
      h[:params] = [] unless h[:params]

      h[:params].each do |p|
        p[:type] = "Object" unless p[:type]
      end

      check_consistency(docs, code, h[:files].first)
    end

    def self.check_consistency(docs, code, file)
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
