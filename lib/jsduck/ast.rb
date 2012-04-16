require "jsduck/serializer"

module JsDuck

  # Analyzes the AST produced by EsprimaParser.
  class Ast
    def initialize
      @serializer = JsDuck::Serializer.new
    end

    # Given parsed code, returns the tagname for documentation item.
    #
    # @param ast :code from Result of EsprimaParser
    # @returns One of: :class, :method, :property
    #
    def detect(ast)
      ast = ast || {}

      exp = expression?(ast) ? ast["expression"] : nil
      var = var?(ast) ? ast["declarations"][0] : nil

      # Ext.define("Class", {})
      if exp && ext_define?(exp)
        make_class(exp["arguments"][0], exp)

      # foo = Ext.extend("Parent", {})
      elsif exp && assignment?(exp) && ext_extend?(exp["right"])
        make_class(exp["left"], exp["right"])

      # Foo = ...
      elsif exp && assignment?(exp) && class_name?(exp["left"])
        make_class(exp["left"])

      # var foo = Ext.extend("Parent", {})
      elsif var && ext_extend?(var["init"])
        make_class(var["id"], var["init"])

      # var Foo = ...
      elsif var && class_name?(var["id"])
        make_class(var["id"])

      # function Foo() {}
      elsif function?(ast) && class_name?(ast["id"])
        make_class(ast["id"])

      # function foo() {}
      elsif function?(ast)
        make_method(ast["id"], ast)

      # foo = function() {}
      elsif exp && assignment?(exp) && function?(exp["right"])
        make_method(exp["left"], exp["right"])

      # var foo = function() {}
      elsif var && function?(var["init"])
        make_method(var["id"], var["init"])

      # foo: function() {}
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

    def ext_define?(ast)
      call?(ast) && ["Ext.define", "Ext.ClassManager.create"].include?(to_s(ast["callee"]))
    end

    def ext_extend?(ast)
      call?(ast) && to_s(ast["callee"]) == "Ext.extend"
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

    def make_class(name_ast, ast=nil)
      cls = {
        :type => :class,
        :name => to_s(name_ast),
      }

      # apply information from Ext.extend or Ext.define
      if ast
        if ext_extend?(ast)
          cls[:extends] = to_s(ast["arguments"][0])
        elsif ext_define?(ast)
          cfg = ast["arguments"][1]
          if cfg && cfg["type"] == "ObjectExpression"
            v = get_key_value(cfg, "extend")
            cls[:extends] = v ? to_s(v) : nil
          end
        end
      end

      return cls
    end

    def get_key_value(obj, key)
      p = obj["properties"].find {|p| to_s(p["key"]) == key }
      p ? p["value"] : nil
    end

    def make_method(name_ast, ast=nil)
      return {
        :type => :method,
        :name => to_s(name_ast),
        :params => (ast && !empty_fn?(ast)) ? ast["params"].map {|p| to_s(p) } : []
      }
    end

    def to_s(ast)
      @serializer.to_s(ast)
    end
  end

end

