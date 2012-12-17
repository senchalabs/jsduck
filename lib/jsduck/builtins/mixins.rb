require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Mixins < Tag
    def initialize
      @pattern = ["mixin", "mixins"]
    end

    # @mixins classname1 classname2 ...
    def parse(p)
      p.add_tag(:mixins)
      p.classname_list(:mixins)
    end
  end
end
