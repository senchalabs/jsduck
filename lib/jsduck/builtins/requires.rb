require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Requires < Tag
    def initialize
      @pattern = "requires"
    end

    # @requires classname1 classname2 ...
    def parse(p)
      p.add_tag(:requires)
      p.classname_list(:requires)
    end
  end
end
