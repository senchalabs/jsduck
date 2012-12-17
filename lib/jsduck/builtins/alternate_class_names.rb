require "jsduck/builtins/tag"

module JsDuck::Builtins
  class AlternateClassNames < Tag
    def initialize
      @pattern = ["alternateClassName", "alternateClassNames"]
    end

    # @alternateClassNames classname1 classname2 ...
    def parse(p)
      p.add_tag(:alternateClassNames)
      p.classname_list(:alternateClassNames)
    end
  end
end
