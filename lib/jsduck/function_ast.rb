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
    # * :void - the code can finish without explicitly returning anything
    # * :this - the code contins 'return this;'
    # * :other - some other value is returned.
    #
    def return_types(ast)
      return_types_hash(ast["body"]["body"]).keys
    end

    private

    def return_types_hash(body)
      rvalues = {}
      body.each do |ast|
        if return_this?(ast)
          rvalues[:this] = true
          return rvalues
        elsif return?(ast)
          rvalues[:other] = true
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

    def return_this?(ast)
      return?(ast) && !!ast["argument"] && this?(ast["argument"])
    end

    def return?(ast)
      ast["type"] == "ReturnStatement"
    end

    def this?(ast)
      ast["type"] == "ThisExpression"
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
