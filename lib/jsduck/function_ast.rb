require "jsduck/util/singleton"
require "jsduck/serializer"
require "jsduck/evaluator"

module JsDuck

  # Analyzes the AST of a FunctionDeclaration or FunctionExpression.
  class FunctionAst
    include Util::Singleton

    # Detects possible return types of the given function.
    #
    # For now there are three possible detected return values:
    #
    # * :this - the code contins 'return this;'
    #
    # * "undefined" - the code finishes by returning undefined or
    #   without explicitly returning anything
    #
    # * :other - some other value is returned.
    #
    def return_types(ast)
      h = return_types_hash(ast["body"]["body"])

      # Replace the special :void value that signifies possibility of
      # exiting without explicitly returning anything
      if h[:void]
        h["undefined"] = true
        h.delete(:void)
      end

      h.keys
    end

    private

    def return_types_hash(body)
      rvalues = {}
      body.each do |ast|
        if return?(ast)
          type = value_type(ast["argument"])
          rvalues[type] = true
          return rvalues
        elsif possibly_blocking?(ast)
          extract_bodies(ast).each do |b|
            rvalues.merge!(return_types_hash(b))
          end
          if !rvalues[:void]
            return rvalues
          else
            rvalues.delete(:void)
          end
        elsif control_flow?(ast)
          extract_bodies(ast).each do |b|
            rvalues.merge!(return_types_hash(b))
          end
          rvalues.delete(:void)
        end
      end

      rvalues[:void] = true
      return rvalues
    end

    def return?(ast)
      ast["type"] == "ReturnStatement"
    end

    def value_type(ast)
      if !ast
        :void
      elsif undefined?(ast) || void?(ast)
        "undefined"
      elsif this?(ast)
        :this
      elsif boolean?(ast)
        "Boolean"
      elsif string?(ast)
        "String"
      elsif regexp?(ast)
        "RegExp"
      else
        :other
      end
    end

    def undefined?(ast)
      ast["type"] == "Identifier" && ast["name"] == "undefined"
    end

    def void?(ast)
      ast["type"] == "UnaryExpression" && ast["operator"] == "void"
    end

    def this?(ast)
      ast["type"] == "ThisExpression"
    end

    def boolean?(ast)
      if boolean_literal?(ast)
        true
      elsif ast["type"] == "UnaryExpression" || ast["type"] == "BinaryExpression"
        !!BOOLEAN_RETURNING_OPERATORS[ast["operator"]]
      elsif ast["type"] == "LogicalExpression"
        boolean?(ast["left"]) && boolean?(ast["right"])
      elsif ast["type"] == "ConditionalExpression"
        boolean?(ast["consequent"]) && boolean?(ast["alternate"])
      elsif ast["type"] == "AssignmentExpression" && ast["operator"] == "="
        boolean?(ast["right"])
      else
        false
      end
    end

    def boolean_literal?(ast)
      ast["type"] == "Literal" && (ast["value"] == true || ast["value"] == false)
    end

    def string?(ast)
      if string_literal?(ast)
        true
      elsif ast["type"] == "BinaryExpression" && ast["operator"] == "+"
        string?(ast["left"]) || string?(ast["right"])
      elsif ast["type"] == "UnaryExpression" && ast["operator"] == "typeof"
        true
      else
        false
      end
    end

    def string_literal?(ast)
      ast["type"] == "Literal" && ast["value"].is_a?(String)
    end

    def regexp?(ast)
      ast["type"] == "Literal" && ast["raw"] =~ /^\//
    end

    def control_flow?(ast)
      CONTROL_FLOW[ast["type"]]
    end

    def extract_bodies(ast)
      body = []
      CONTROL_FLOW[ast["type"]].each do |name|
        statements = ast[name]
        if statements.is_a?(Hash)
          body << [statements]
        else
          body << Array(statements)
        end
      end
      body
    end

    # True if the node is a control structure which will block further
    # program flow when all its branches finish with a return
    # statement.
    def possibly_blocking?(ast)
      if POSSIBLY_BLOCKING[ast["type"]]
        CONTROL_FLOW[ast["type"]].all? {|key| ast[key] }
      else
        false
      end
    end

    BOOLEAN_RETURNING_OPERATORS = {
      "!" => true,
      ">" => true,
      ">=" => true,
      "<" => true,
      "<=" => true,
      "==" => true,
      "!=" => true,
      "===" => true,
      "!==" => true,
      "in" => true,
      "instanceof" => true,
      "delete" => true,
    }

    POSSIBLY_BLOCKING = {
      "IfStatement" => true,
      "DoWhileStatement" => true,
      "WithStatement" => true,
      "LabeledStatement" => true,
      "BlockStatement" => true,
    }

    CONTROL_FLOW = {
      "IfStatement" => ["consequent", "alternate"],
      "SwitchStatement" => ["cases"],
      "SwitchCase" => ["consequent"],
      "ForStatement" => ["body"],
      "ForInStatement" => ["body"],
      "WhileStatement" => ["body"],
      "DoWhileStatement" => ["body"],
      "TryStatement" => ["block", "handlers", "finalizer"],
      "CatchClause" => ["body"],
      "WithStatement" => ["body"],
      "LabeledStatement" => ["body"],
      "BlockStatement" => ["body"],
    }
  end

end
