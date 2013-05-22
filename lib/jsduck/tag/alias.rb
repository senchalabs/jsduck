require "jsduck/tag/inheritdoc"
require "jsduck/js/utils"

module JsDuck::Tag
  class Alias < Inheritdoc
    def initialize
      @pattern = "alias"
      @tagname = :aliases
      @repeatable = true
      @ext_define_pattern = "alias"
      @ext_define_default = {:aliases => []}
    end

    # For backwards compatibility decide whether the @alias was used
    # as @inheritdoc (@alias used to have the meaning of @inheritdoc
    # before) or as a real Ext4 style alias definition.
    def parse_doc(p, pos)
      if p.look(/([\w.]+)?#\w+/)
        parse_as_inheritdoc(p)
      else
        parse_as_alias(p)
      end
    end

    # @alias widget.foo
    def parse_as_alias(p)
      {
        :tagname => :aliases,
        :name => p.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:aliases] = tags.map {|tag| tag[:name] }
    end

    def parse_ext_define(cls, ast)
      cls[:aliases] += JsDuck::Js::Utils.make_string_list(ast)
    end

  end
end
