require "jsduck/tag/tag"

module JsDuck::Tag
  class Mixins < Tag
    def initialize
      @pattern = ["mixin", "mixins"]
      @key = :mixins
      @ext_define_pattern = "mixins"
      @ext_define_default = {:mixins => []}
    end

    # @mixins classname1 classname2 ...
    def parse(p)
      p.add_tag(:mixins)
      p.classname_list(:mixins)
    end

    def process_doc(tags)
      tags.map {|d| d[@key] }.flatten
    end

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
