require "jsduck/tag/tag"

module JsDuck::Tag
  # Base class for simple boolean @tags.
  # Subclasses should only define @pattern and call #super,
  # which will take care of setting up @tagname with the same name.
  class BooleanTag < Tag
    def initialize
      if @pattern
        @tagname = @pattern.to_sym
      end
    end

    # Parses just the name of the tag.
    def parse_doc(p, pos)
      {:tagname => @tagname}
    end

    # When the tag is found, its value will always be true.
    def process_doc(h, docs, pos)
      h[@tagname] = true
    end
  end
end
