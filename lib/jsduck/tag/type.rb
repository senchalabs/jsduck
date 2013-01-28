require "jsduck/tag/tag"

module JsDuck::Tag
  class Type < Tag
    def initialize
      @pattern = "type"
      @key = :type
      @merge_context = :property_like
    end

    # matches @type {type}  or  @type type
    #
    # The presence of @type implies that we are dealing with property.
    # ext-doc allows type name to be either inside curly braces or
    # without them at all.
    def parse_doc(p)
      tag = p.standard_tag({:tagname => :type, :type => true})
      tag[:type] = curlyless_type(p) unless tag[:type]
      tag
    end

    def curlyless_type(p)
      p.hw.match(/\S+/)
    end

    def process_doc(h, tags, pos)
      h[:type] = tags[0][:type] unless h[:type]
    end

    # Do the merging of :type field
    def merge(h, docs, code)
      h[:type] = merge_if_code_matches(:type, docs, code)
      if h[:type] == nil
        h[:type] = code[:tagname] == :method ? "Function" : "Object"
      end
    end

    private

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
