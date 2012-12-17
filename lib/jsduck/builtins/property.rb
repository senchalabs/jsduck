require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Property < Tag
    def initialize
      @pattern = "property"
    end

    # @property {Type} [name=default] ...
    def parse(p)
      p.add_tag(:property)
      p.maybe_type
      p.maybe_name_with_default
    end
  end
end
