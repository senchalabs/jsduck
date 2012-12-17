require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Uses < Tag
    def initialize
      @pattern = "uses"
    end

    # @uses classname1 classname2 ...
    def parse(p)
      p.add_tag(:uses)
      p.classname_list(:uses)
    end
  end
end
