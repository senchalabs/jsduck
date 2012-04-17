module JsDuck

  # Evaluates Esprima AST node into Ruby object
  class Evaluator

    # Converts AST node into a value.
    #
    # - String literals become Ruby strings
    # - Number literals become Ruby number
    # - Array expressions become Ruby arrays
    # - etc
    #
    # For anything it doesn't know how to evaluate (like a function
    # expression) it throws exception.
    #
    def to_value(ast)
      case ast["type"]
      when "ArrayExpression"
        ast["elements"].map {|e| to_value(e) }
      when "Identifier"
        ast["name"]
      when "Literal"
        ast["value"]
      else
        throw "Unknown node type: " + ast["type"]
      end
    end

  end

end

