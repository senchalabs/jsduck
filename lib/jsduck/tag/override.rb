require "jsduck/tag/tag"
require "jsduck/ast_utils"

module JsDuck::Tag
  class Override < Tag
    def initialize
      @pattern = "override"
      @key = :override
      @ext_define_pattern = "override"
    end

    # @override nameOfOverride
    def parse(p)
      if classname = p.hw.ident_chain
        {
          :tagname => :override,
          :override => classname,
        }
      else
        # When @override not followed by class name, ignore the tag.
        # That's because the current ext codebase has some methods
        # tagged with @override to denote they override something.
        # But that's not what @override is meant for in JSDuck.
        nil
      end
    end

    def process_doc(tags)
      tags[0][:override]
    end

    def parse_ext_define(cls, ast)
      cls[:override] = JsDuck::AstUtils.make_string(ast)
    end

  end
end
