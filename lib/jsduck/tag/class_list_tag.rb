require "jsduck/tag/tag"
require "jsduck/js/utils"

module JsDuck::Tag
  # Base class for tags like @mixins, @uses, etc
  # Which take the following form:
  #
  #     @tagname classname1 classname2 ...
  #
  # Subclasses need to define the @patterns and @key fields for the
  # #parse and #process_doc methods to work. Plus @ext_define_pattern
  # and @ext_define_default for the #parse_ext_define to work.
  #
  class ClassListTag < Tag
    def parse(p)
      {
        :tagname => @key,
        :classes => classname_list(p),
      }
    end

    # matches <ident_chain> <ident_chain> ... until line end
    def classname_list(p)
      classes = []
      while cls = p.hw.ident_chain
        classes << cls
      end
      classes
    end

    def process_doc(h, tags, pos)
      h[@key] = tags.map {|d| d[:classes] }.flatten
    end

    def parse_ext_define(cls, ast)
      cls[@key] = JsDuck::Js::Utils.make_string_list(ast)
    end
  end
end
