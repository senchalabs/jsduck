require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Inheritdoc < Tag
    def initialize
      @pattern = ["inheritdoc", "inheritDoc"]
    end

    # @inheritdoc class.name#static-type-member
    def parse(p)
      parse_as_inheritdoc(p)
    end

    # This separate method exits to allow it to be also called from
    # @alias tag implementation.
    def parse_as_inheritdoc(p)
      p.add_tag(:inheritdoc)
      p.maybe_ident_chain(:cls)
      p.maybe_member_reference
    end
  end
end
