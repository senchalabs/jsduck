require "jsduck/tag/tag"

module JsDuck::Tag
  class Type < Tag
    def initialize
      @pattern = "type"
      @key = :type
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

  end
end
