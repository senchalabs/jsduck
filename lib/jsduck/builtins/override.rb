require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Override < Tag
    def initialize
      @pattern = "override"
    end

    # @override nameOfOverride
    def parse(p)
      p.add_tag(:override)
      p.maybe_ident_chain(:class)

      # When @override not followed by class name, ignore the tag.
      # That's because the current ext codebase has some methods
      # tagged with @override to denote they override something.
      # But that's not what @override is meant for in JSDuck.
      unless p.current_tag[:class]
        p.remove_last_tag
      end
    end

  end
end
