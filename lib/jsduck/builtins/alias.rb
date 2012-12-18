require "jsduck/builtins/inheritdoc"

module JsDuck::Builtins
  class Alias < Inheritdoc
    def initialize
      @pattern = "alias"
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
      p.add_tag(:alias)
      p.maybe_ident_chain(:name)
    end
  end
end
