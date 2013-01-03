require "jsduck/tag/tag"
require "jsduck/ast_utils"

module JsDuck::Tag
  class Override < Tag
    def initialize
      @pattern = "override"
      @ext_define_pattern = "override"
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

    def parse_ext_define(cls, ast)
      cls[:override] = JsDuck::AstUtils.make_string(ast)
    end

  end
end
