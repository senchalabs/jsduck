require "jsduck/tag/tag"

module JsDuck::Tag
  class Throws < Tag
    def initialize
      @pattern = "throws"
      @key = :throws
    end

    # @throws {Type} ...
    def parse(p)
      tag = p.standard_tag({:tagname => :throws, :type => true})
      tag[:doc] = :multiline
      tag
    end

    def process_doc(h, tags, pos)
      result = tags.map do |throws|
        {
          :type => throws[:type] || "Object",
          :doc => throws[:doc] || "",
        }
      end

      h[:throws] = result
    end
  end
end
