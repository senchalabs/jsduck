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
      TagRegistry.mergers(:method_like).each do |tag|
        tag.merge(h, docs, code)
      end

      do_merge(h, docs, code)
    end

    def merge_like_property(docs, code)
      h = {}
      TagRegistry.mergers(:property_like).each do |tag|
        tag.merge(h, docs, code)
      end

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

  end

end
