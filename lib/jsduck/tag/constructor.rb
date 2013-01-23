require "jsduck/tag/tag"

module JsDuck::Tag
  class Constructor < Tag
    def initialize
      @pattern = "constructor"
      @key = :constructor
    end

    # @constructor
    def parse_doc(p)
      {:tagname => :constructor, :doc => :multiline}
    end

    # The method name will become "constructor" unless a separate
    # @method tag already supplied the name.
    def process_doc(h, tags, pos)
      h[:name] = "constructor" unless h[:name]
    end
  end
end
