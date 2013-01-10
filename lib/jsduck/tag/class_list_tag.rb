require "jsduck/tag/tag"
require "jsduck/ast_utils"

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
        :classes => p.hw && p.classname_list,
        :doc => "",
      }
    end

    def process_doc(tags)
      tags.map {|d| d[:classes] }.flatten
    end

    def parse_ext_define(cls, ast)
      cls[@key] = JsDuck::AstUtils.make_string_list(ast)
    end
  end
end
