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
        make_method(ast["id"], ast)
      elsif exp && assignment?(exp) && function?(exp["right"])
        make_method(exp["left"], exp["right"])
      elsif var && function?(var["init"])
        make_method(var["id"], var["init"])
      elsif property?(ast) && function?(ast["value"])
        make_method(ast["key"], ast["value"])
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

    def make_method(name_ast, ast=nil)
      return {
        :type => :method,
        :name => to_s(name_ast),
        :params => (ast && !empty_fn?(ast)) ? ast["params"].map {|p| to_s(p) } : []
      }
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

