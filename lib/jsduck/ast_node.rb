require "jsduck/serializer"
require "jsduck/evaluator"
require "jsduck/ext_patterns"

module JsDuck

  # Wraps around AST node returned from Esprima, providing methods for
  # investigating it.
  class AstNode
    # Initialized with a AST Hash from Esprima.
    def initialize(node)
      @node = node
    end

    def expression?
      @node["type"] == "ExpressionStatement"
    end

    def call?
      @node["type"] == "CallExpression"
    end

    def assignment?(ast)
      @node["type"] == "AssignmentExpression"
    end

    def function?(ast)
      @node["type"] == "FunctionDeclaration" || @node["type"] == "FunctionExpression" || empty_fn?
    end

    def empty_fn?(ast)
      @node["type"] == "MemberExpression" && ext_pattern?("Ext.emptyFn")
    end

    def ext_pattern?(pattern)
      @ext_patterns.matches?(pattern, to_s)
    end

    def fire_event?(ast)
      call? && child("callee").to_s == "this.fireEvent"
    end

    def var?(ast)
      @node["type"] == "VariableDeclaration"
    end

    def property?(ast)
      @node["type"] == "Property"
    end

    def ident?(ast)
      @node["type"] == "Identifier"
    end

    def string?(ast)
      @node["type"] == "Literal" && @node["value"].is_a?(String)
    end

    def object?(ast)
      @node["type"] == "ObjectExpression"
    end

    # Returns a child AST node as AstNode class.
    def child(name)
      AstNode.new(@node[name])
    end

    # Serializes the node into string
    def to_s
      Serializer.new.to_s(@node)
    end

    # Evaluates the node into basic JavaScript value.
    def to_value
      begin
        Evaluator.new.to_value(@node)
      rescue
        nil
      end
    end

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

  end

end
