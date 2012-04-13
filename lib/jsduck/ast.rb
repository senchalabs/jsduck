module JsDuck

  # Analyzes the AST produced by EsprimaParser.
  class Ast
    # Given parsed code, returns the tagname for documentation item.
    #
    # @param ast :code from Result of EsprimaParser
    # @returns One of: :class, :method, :event, :cfg, :property, :css_var
    #
    def detect(ast)
      ast = ast || {}

      exp = expression?(ast) ? ast["expression"] : nil
      var = var?(ast) ? ast["declarations"][0] : nil

      if exp && call?(exp) && ext_define?(exp["callee"])
        {:type => :class}
      elsif exp && assignment?(exp) && class_name?(exp["left"])
        {:type => :class}
      elsif var && class_name?(var["id"])
        {:type => :class}
      elsif function?(ast) && class_name?(ast["id"])
        {:type => :class}
      elsif function?(ast)
        {:type => :method}
      elsif exp && assignment?(exp) && function?(exp["right"])
        {:type => :method}
      elsif var && function?(var["init"])
        {:type => :method}
      elsif property?(ast) && function?(ast["value"])
        {:type => :method}
      else
        {:type => :property}
      end
    end

    private

    def expression?(ast)
      ast["type"] == "ExpressionStatement"
    end

    def call?(ast)
      ast["type"] == "CallExpression"
    end

    def assignment?(ast)
      ast["type"] == "AssignmentExpression"
    end

    def ext_define?(callee)
      ["Ext.define", "Ext.ClassManager.create"].include?(to_s(callee))
    end

    def function?(ast)
      ast["type"] == "FunctionDeclaration" || ast["type"] == "FunctionExpression" || empty_fn?(ast)
    end

    def empty_fn?(ast)
      ast["type"] == "MemberExpression" && to_s(ast) == "Ext.emptyFn"
    end

    def var?(ast)
      ast["type"] == "VariableDeclaration"
    end

    def property?(ast)
      ast["type"] == "Property"
    end

    # Class name begins with upcase char
    def class_name?(ast)
      return to_s(ast).split(/\./).last =~ /\A[A-Z]/
    end

    def to_s(ast)
      case ast["type"]
      when "MemberExpression"
        if ast["computed"]
          to_s(ast["object"]) + "[" + to_s(ast["property"]) + "]"
        else
          to_s(ast["object"]) + "." + to_s(ast["property"])
        end
      when "Identifier"
        ast["name"]
      when "Literal"
        ast["value"]
      end
    end
  end

end

