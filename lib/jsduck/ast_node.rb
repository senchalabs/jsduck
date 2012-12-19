require "jsduck/serializer"
require "jsduck/evaluator"
require "jsduck/ext_patterns"
require "jsduck/ast_node_array"

module JsDuck

  # Wraps around AST node returned from Esprima, providing methods for
  # investigating it.
  class AstNode
    # Factor method that creates either AstNode or AstNodeArray.
    def self.create(node)
      if node.is_a? Array
        AstNodeArray.new(node)
      else
        AstNode.new(node)
      end
    end

    # Initialized with a AST Hash from Esprima.
    def initialize(node)
      @node = node || {}
    end

    # Returns a child AST node as AstNode class.
    def child(name)
      AstNode.create(@node[name])
    end
    # Shorthand for #child method
    def [](name)
      child(name)
    end

    # Returns the raw Exprima AST node this class wraps.
    def raw
      @node
    end

    # Serializes the node into string
    def to_s
      begin
        Serializer.new.to_s(@node)
      rescue
        nil
      end
    end

    # Evaluates the node into basic JavaScript value.
    def to_value
      begin
        Evaluator.new.to_value(@node)
      rescue
        nil
      end
    end

    # Converts object expression property key to string value
    def key_value
      Evaluator.new.key_value(@node)
    end

    # Returns the type of node value.
    def value_type
      v = to_value
      if v.is_a?(String)
        "String"
      elsif v.is_a?(Numeric)
        "Number"
      elsif v.is_a?(TrueClass) || v.is_a?(FalseClass)
        "Boolean"
      elsif v.is_a?(Array)
        "Array"
      elsif v.is_a?(Hash)
        "Object"
      elsif v == :regexp
        "RegExp"
      else
        nil
      end
    end

    # Iterates over keys and values in ObjectExpression.  The keys
    # are turned into strings, but values are left as is for further
    # processing.
    def each_property
      return unless object_expression?

      child("properties").each do |ast|
        yield(ast["key"].key_value, ast["value"], ast)
      end
    end

    # Returns line number in parsed source where the AstNode resides.
    def linenr
      # Get line number from third place at range array.
      # This third item exists in forked EsprimaJS at
      # https://github.com/nene/esprima/tree/linenr-in-range
      @node["range"][2]
    end

    # Tests for higher level types which don't correspond directly to
    # Esprima AST types.

    def function?
      function_declaration? || function_expression? || ext_empty_fn?
    end

    def fire_event?
      call_expression? && child("callee").to_s == "this.fireEvent"
    end

    def string?
      literal? && @node["value"].is_a?(String)
    end

    # Checks dependent on Ext namespace,
    # which may not always be "Ext" but also something user-defined.

    def ext_empty_fn?
      member_expression? && ext_pattern?("Ext.emptyFn")
    end

    def ext_define?
      call_expression? && child("callee").ext_pattern?("Ext.define")
    end

    def ext_extend?
      call_expression? && child("callee").ext_pattern?("Ext.extend")
    end

    def ext_override?
      call_expression? && child("callee").ext_pattern?("Ext.override")
    end

    def ext_pattern?(pattern)
      ExtPatterns.matches?(pattern, to_s)
    end

    # Simple shorthands for testing the type of node
    # These have one-to-one mapping to Esprima node types.

    def call_expression?
      @node["type"] == "CallExpression"
    end

    def assignment_expression?
      @node["type"] == "AssignmentExpression"
    end

    def object_expression?
      @node["type"] == "ObjectExpression"
    end

    def array_expression?
      @node["type"] == "ArrayExpression"
    end

    def function_expression?
      @node["type"] == "FunctionExpression"
    end

    def member_expression?
      @node["type"] == "MemberExpression"
    end

    def expression_statement?
      @node["type"] == "ExpressionStatement"
    end

    def variable_declaration?
      @node["type"] == "VariableDeclaration"
    end

    def function_declaration?
      @node["type"] == "FunctionDeclaration"
    end

    def property?
      @node["type"] == "Property"
    end

    def identifier?
      @node["type"] == "Identifier"
    end

    def literal?
      @node["type"] == "Literal"
    end

  end

end
