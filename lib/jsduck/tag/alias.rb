require "jsduck/tag/inheritdoc"
require "jsduck/ast_utils"

module JsDuck::Tag
  class Alias < Inheritdoc
    def initialize
      @pattern = "alias"
      @key = :aliases
      @ext_define_pattern = "alias"
      @ext_define_default = {:aliases => []}
    end

    # For backwards compatibility decide whether the @alias was used
    # as @inheritdoc (@alias used to have the meaning of @inheritdoc
    # before) or as a real Ext4 style alias definition.
    def parse(p)
      if p.look(/\s+([\w.]+)?#\w+/)
        parse_as_inheritdoc(p)
      else
        parse_as_alias(p)
      end
    end

    # @alias widget.foo
    def parse_as_alias(p)
      {
        :tagname => :aliases,
        :name => p.hw.ident_chain,
      }
    end

    def process_doc(tags)
      tags.map {|tag| tag[:name] }
    end

    def parse_ext_define(cls, ast)
      cls[:aliases] += JsDuck::AstUtils.make_string_list(ast)
    end
  end
end
