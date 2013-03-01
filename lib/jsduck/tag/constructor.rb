require "jsduck/tag/tag"

module JsDuck::Tag
  class Constructor < Tag
    def initialize
      @pattern = "constructor"
      @tagname = :constructor
    end

    # @constructor
    def parse_doc(p, pos)
      {:tagname => :constructor, :doc => :multiline}
    end

    # The method name will become "constructor" unless a separate
    # @method tag already supplied the name.
    def process_doc(h, tags, pos)
      h[:name] = "constructor" unless h[:name]
      # Documentation after @constructor is part of the constructor
      # method top-level docs.
      h[:doc] += tags[0][:doc]
    end
  end
end
