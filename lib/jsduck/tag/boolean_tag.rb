require "jsduck/tag/tag"

module JsDuck::Tag
  # Base class for simple boolean @tags.
  # Subclasses should only define @pattern and call #super,
  # which will take care of setting up @key with the same name.
  class BooleanTag < Tag
    def initialize
      if @pattern
        @key = @pattern.to_sym
      end
    end

    # Parses just the name of the tag.
    def parse_doc(p)
      {:tagname => @key}
    end

    # When the tag is found, its value will always be true.
    def process_doc(h, docs, pos)
      h[@key] = true
    end
  end
end
