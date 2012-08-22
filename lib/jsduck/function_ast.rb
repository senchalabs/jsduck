require "singleton"
require "jsduck/serializer"
require "jsduck/evaluator"

module JsDuck

  # Analyzes the AST of a FunctionDeclaration or FunctionExpression.
  class FunctionAst
    include Singleton

    # True when function always finishes by returning this.  False
    # doesn't neccessarily mean that the function doesn't return this
    # - rather it means our static analyzes wasn't able to determine
    # what the function returns.
    def self.chainable?(ast)
      FunctionAst.instance.chainable?(ast)
    end

    def chainable?(ast)
      if ast && function?(ast)
        body_returns(ast["body"]["body"])
      else
        false
      end
    end

    private

    def function?(ast)
      ast["type"] == "FunctionDeclaration" || ast["type"] == "FunctionExpression"
    end

    def body_returns(body)
      body = skip_non_control_flow_statements(body)

      return body.length > 0 && return_this?(body[0])
    end

    def return_this?(ast)
      return?(ast) && this?(ast["argument"])
    end

    def return?(ast)
      ast["type"] == "ReturnStatement"
    end

    def this?(ast)
      ast["type"] == "ThisExpression"
    end

    def skip_non_control_flow_statements(statements)
      i = statements.find_index {|s| control_flow?(s) }
      if i
        statements.slice(i, statements.length)
      else
        []
      end
    end

    def control_flow?(ast)
      [
        "IfStatement",
        "SwitchStatement",
        "ForStatement",
        "ForInStatement",
        "WhileStatement",
        "DoWhileStatement",
        "ReturnStatement",
        "TryStatement",
        "WithStatement",
        "LabeledStatement",
        "BlockStatement",
      ].include?(ast["type"])
    end
  end

end

