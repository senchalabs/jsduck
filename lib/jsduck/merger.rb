require 'jsduck/class'
require 'jsduck/tag_registry'

module JsDuck

  # Takes data from comment and code that follows it and combines
  # these two pieces of information into one.  The code comes from
  # JsDuck::Ast and comment from JsDuck::DocAst.
  #
  # The main method merge() produces a hash as a result.
  class Merger

    # Takes a docset and merges the :comment and :code inside it,
    # producing hash as a result.
    def merge(docset)
      docs = docset[:comment]
      code = docset[:code]

      case docset[:tagname]
      when :class
        result = merge_class(docs, code)
      when :method, :event, :css_mixin
        result = merge_like_method(docs, code)
      when :cfg, :property, :css_var
        result = merge_like_property(docs, code)
      end

      result[:linenr] = docset[:linenr]

      result
    end

    private

    def merge_class(docs, code)
      h = {}
      TagRegistry.mergers(:class).each do |tag|
        tag.merge(h, docs, code)
      end

      do_merge(h, docs, code)
    end

    def merge_like_method(docs, code)
      h = {}
      h[:params] = merge_params(docs, code)

      do_merge(h, docs, code)
    end

    def merge_like_property(docs, code)
      h = {}

      h[:type] = merge_if_code_matches(:type, docs, code)
      if h[:type] == nil
        h[:type] = code[:tagname] == :method ? "Function" : "Object"
      end

      h[:default] = merge_if_code_matches(:default, docs, code)

      do_merge(h, docs, code)
    end

    # --- helpers ---

    def do_merge(h, docs, code)
      h[:name] = merge_name(docs, code)

      docs.each_pair do |key, value|
        h[key] = docs[key] || code[key] unless h.has_key?(key)
      end
      # Add items only detected in code.
      code.each_pair do |key, value|
        h[key] = value unless h.has_key?(key)
      end

      h[:id] = JsDuck::Class.member_id(h)

      h
    end

    def merge_params(docs, code)
      explicit = docs[:params] || []
      implicit = code_matches_doc?(docs, code) ? (code[:params] || []) : []
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

    def merge_name(docs, code)
      if docs[:name]
        docs[:name]
      elsif code[:name]
        if docs[:tagname] == :class
          code[:name]
        else
          code[:name].split(/\./).last
        end
      else
        ""
      end
    end

    def merge_if_code_matches(key, docs, code, default=nil)
      if docs[key]
        docs[key]
      elsif code[key] && code_matches_doc?(docs, code)
        code[key]
      else
        default
      end
    end

    # True if the name detected from code matches with explicitly documented name.
    # Also true when no explicit name documented.
    def code_matches_doc?(docs, code)
      return docs[:name] == nil || docs[:name] == code[:name]
    end

  end

end
