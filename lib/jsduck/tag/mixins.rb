require "jsduck/tag/class_list_tag"

module JsDuck::Tag
  class Mixins < ClassListTag
    def initialize
      @pattern = ["mixin", "mixins"]
      @key = :mixins
      @ext_define_pattern = "mixins"
      @ext_define_default = {:mixins => []}
    end

    # Override definition in parent class.  In addition to Array
    # literal, mixins can be defined with an object literal.
    def parse_ext_define(cls, ast)
      cls[:mixins] = to_mixins_array(ast)
    end

    # converts AstNode, whether it's a string, array or hash into
    # array of strings (when possible).
    def to_mixins_array(ast)
      v = ast.to_value
      mixins = v.is_a?(Hash) ? v.values : Array(v)
      mixins.all? {|mx| mx.is_a? String } ? mixins : []
    end
  end
end
