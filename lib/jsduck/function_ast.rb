require "jsduck/util/singleton"
require "jsduck/serializer"
require "jsduck/evaluator"

module JsDuck

  # Analyzes the AST of a FunctionDeclaration or FunctionExpression.
  class FunctionAst
    include Util::Singleton

    # True when function always finishes by returning this.  False
    # doesn't neccessarily mean that the function doesn't return this
    # - rather it means our static analyzes wasn't able to determine
    # what the function returns.
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
      body = skip_returnless_statements(body)

      return body.length > 0 && return_this?(body[0])
    end

    def return_this?(ast)
      return?(ast) && !!ast["argument"] && this?(ast["argument"])
    end

    def return?(ast)
      ast["type"] == "ReturnStatement"
    end

    def this?(ast)
      ast["type"] == "ThisExpression"
    end

    def skip_returnless_statements(statements)
      i = statements.find_index {|s| contains_return?(s) }
      if i
        statements.slice(i, statements.length)
      else
        []
      end
    end

    def contains_return?(ast)
      if return?(ast)
        true
      elsif control_flow?(ast)
        extract_body(ast).any? {|s| contains_return?(s) }
      else
        false
      end
    end

    def control_flow?(ast)
      CONTROL_FLOW[ast["type"]]
    end

    def extract_body(ast)
      body = []
      CONTROL_FLOW[ast["type"]].each do |name|
        statements = ast[name]
        if statements.is_a?(Hash)
          body << statements
        else
          body += Array(statements)
        end
      end
      body
    end

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
