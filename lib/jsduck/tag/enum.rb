require "jsduck/tag/tag"

module JsDuck::Tag
  class Enum < Tag
    def initialize
      @pattern = "enum"
    end

    # @enum {Type} [name=default] ...
    def parse(p)
      # @enum is a special case of class
      tag = p.standard_tag({:tagname => :class})
      tag[:enum] = true
      tag
    end

  end
end
