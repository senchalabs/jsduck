require "jsduck/tag/tag"
require "jsduck/js/utils"

module JsDuck::Tag
  class Extends < Tag
    def initialize
      @pattern = ["extend", "extends"]
      @tagname = :extends
      @ext_define_pattern = "extend"
      @ext_define_default = {:extends => "Ext.Base"}
      @merge_context = :class
    end

    # @extends classname
    # or
    # @extends {classname}
    def parse_doc(p)
      if p.match(/\{/)
        cls = p.ident_chain
        p.match(/\}/)
      else
        cls = p.ident_chain
      end

      {
        :tagname => :extends,
        :extends => cls,
      }
    end

    def process_doc(h, tags, pos)
      h[:extends] = tags[0][:extends]
    end

    def parse_ext_define(cls, ast)
      cls[:extends] = JsDuck::Js::Utils.make_string(ast)
    end

    # Ignore extending of the Object class
    def merge(h, docs, code)
      h[:extends] = docs[:extends] || code[:extends]
      h[:extends] = nil if h[:extends] == "Object"
    end
  end
end
