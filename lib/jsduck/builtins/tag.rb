module JsDuck::Builtins
  # Base class for all builtin tags.
  class Tag
    # Defines the name of the @tag.
    # The name itself must not contain the "@" sign.
    # For example: "cfg"
    attr_reader :pattern

    # Called by DocParser when the @tag is reached to do the parsing
    # from that point forward.  Gets passed an instance of DocParser.
    def parse(p)
    end

    # Defines the name of object property in Ext.define()
    # configuration which, when encountered, will cause the
    # #parse_ext_define method to be invoked.
    attr_reader :ext_define_pattern

    # The default value to use when Ext.define is encountered, but the
    # key in the config object itself is not found.
    # This must be a Hash defining the key and value.
    attr_reader :ext_define_default

    # Called by Ast class to parse a config in Ext.define().
    # @param {Hash} cls A simple Hash representing a class on which
    # various properties can be set.
    # @param {AstNode} ast Value of the config in Ext.define().
    def parse_ext_define(cls, ast)
    end

    # Returns all descendants of JsDuck::Builtins::Tag class.
    def self.descendants
      result = []
      ObjectSpace.each_object(::Class) do |cls|
        result << cls if cls < self
      end
      result
    end
  end
end
