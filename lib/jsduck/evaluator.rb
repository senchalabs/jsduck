module JsDuck

  # Evaluates Esprima AST node into Ruby object
  class Evaluator

    # Converts AST node into a value.
    #
    # - String literals become Ruby strings
    # - Number literals become Ruby numbers
    # - Regex literals become :regexp symbols
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
      when "ObjectExpression"
        h = {}
        ast["properties"].each do |p|
          key = key_value(p["key"])
          value = to_value(p["value"])
          h[key] = value
        end
        h
      when "BinaryExpression"
        if ast["operator"] == "+"
          to_value(ast["left"]) + to_value(ast["right"])
        else
          throw "Unable to handle operator: " + ast["operator"]
        end
      when "MemberExpression"
        if base_css_prefix?(ast)
          "x-"
        else
          throw "Unable to handle this MemberExpression"
        end
      when "Literal"
        if ast["raw"] =~ /\A\//
          :regexp
        else
          ast["value"]
        end
      else
        throw "Unknown node type: " + ast["type"]
      end
    end

    # Turns object property key into string value
    def key_value(key)
      key["type"] == "Identifier" ? key["name"] : key["value"]
    end

    # True when MemberExpression == Ext.baseCSSPrefix
    def base_css_prefix?(ast)
      ast["computed"] == false &&
        ast["object"]["type"] == "Identifier" &&
        ast["object"]["name"] == "Ext" &&
        ast["property"]["type"] == "Identifier" &&
        ast["property"]["name"] == "baseCSSPrefix"
    end

  end

end

