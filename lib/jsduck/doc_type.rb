module JsDuck

  # Detects the type of documentation object: class, method, cfg, etc
  class DocType
    # Given parsed documentation and code, returns the tagname for
    # documentation item.
    #
    # @param docs Result from DocParser
    # @param code Result from Ast#detect or CssParser#parse
    # @returns One of: :class, :method, :event, :cfg, :property, :css_var, :css_mixin
    #
    def detect(docs, code)
      doc_map = build_doc_map(docs)

      if doc_map[:class] || doc_map[:override]
        :class
      elsif doc_map[:event]
        :event
      elsif doc_map[:method]
        :method
      elsif doc_map[:property] || doc_map[:type]
        :property
      elsif doc_map[:css_var]
        :css_var
      elsif doc_map[:cfg] && doc_map[:cfg].length == 1
        # When just one @cfg, avoid treating it as @class
        :cfg
      elsif code[:tagname] == :class
        :class
      elsif code[:tagname] == :css_mixin
        :css_mixin
      elsif doc_map[:cfg]
        :cfg
      elsif doc_map[:constructor]
        :method
      elsif doc_map[:param] || doc_map[:return]
        :method
      else
        code[:tagname]
      end
    end

    private

    # Build map of at-tags for quick lookup
    def build_doc_map(docs)
      map = {}
      docs.each do |tag|
        if map[tag[:tagname]]
          map[tag[:tagname]] << tag
        else
          map[tag[:tagname]] = [tag]
        end
      end
      map
    end
  end

end
