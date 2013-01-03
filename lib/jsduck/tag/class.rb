require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
    end

    # @class name
    def parse(p)
      p.add_tag(:class)
      p.maybe_ident_chain(:name)
    end
  end
end
