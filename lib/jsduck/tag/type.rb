require "jsduck/tag/tag"

module JsDuck::Tag
  class Type < Tag
    def initialize
      @pattern = "type"
      @tagname = :type
      @merge_context = :property_like

      # We don't really care about the position as we don't output any
      # HTML. We just need to set this up to do the formatting.
      @html_position = POS_DOC
    end

    # matches @type {type}  or  @type type
    #
    # The presence of @type implies that we are dealing with property.
    # ext-doc allows type name to be either inside curly braces or
    # without them at all.
    def parse_doc(p, pos)
      tag = p.standard_tag({:tagname => :type, :type => true})
      tag[:type] = curlyless_type(p) unless tag[:type]
      tag
    end

    def curlyless_type(p)
      p.match(/\S+/)
    end

    def process_doc(h, tags, pos)
      h[:type] = tags[0][:type] unless h[:type]
    end

    # Do the merging of :type field
    def merge(h, docs, code)
      if h[:type] == nil
        h[:type] = code[:tagname] == :method ? "Function" : "Object"
      end
    end

    def format(m, formatter)
      m[:html_type] = formatter.format_type(m[:type])
    end

  end
end
