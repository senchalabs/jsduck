require "jsduck/tag/tag"

module JsDuck::Tag
  class Throws < Tag
    def initialize
      @pattern = "throws"
      @key = :throws
      @multiline = true
    end

    # @throws {Type} ...
    def parse(p)
      p.standard_tag({:tagname => :throws, :type => true})
    end

    def process_doc(tags)
      tags.map do |throws|
        {
          :type => throws[:type] || "Object",
          :doc => throws[:doc] || "",
        }
      end
    end
  end
end
