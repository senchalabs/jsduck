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
        make_class(to_s_value(exp["arguments"][0]), exp)

      # foo = Ext.extend("Parent", {})
      elsif exp && assignment?(exp) && ext_extend?(exp["right"])
        make_class(to_s(exp["left"]), exp["right"])

      # Foo = ...
      elsif exp && assignment?(exp) && class_name?(to_s(exp["left"]))
        make_class(to_s(exp["left"]))

      # var foo = Ext.extend("Parent", {})
      elsif var && ext_extend?(var["init"])
        make_class(to_s(var["id"]), var["init"])

      # var Foo = ...
      elsif var && class_name?(to_s(var["id"]))
        make_class(to_s(var["id"]))

      # function Foo() {}
      elsif function?(ast) && class_name?(to_s(ast["id"]))
        make_class(to_s(ast["id"]))

      # function foo() {}
      elsif function?(ast)
        make_method(to_s(ast["id"]), ast)

      # foo = function() {}
      elsif exp && assignment?(exp) && function?(exp["right"])
        make_method(to_s(exp["left"]), exp["right"])

      # var foo = function() {}
      elsif var && function?(var["init"])
        make_method(to_s(var["id"]), var["init"])

      # foo: function() {}
      elsif property?(ast) && function?(ast["value"])
        make_method(to_s_value(ast["key"]), ast["value"])

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
    def class_name?(name)
      return name.split(/\./).last =~ /\A[A-Z]/
    end

    def make_class(name, ast=nil)
      cls = {
        :type => :class,
        :name => name,
      }

      # apply information from Ext.extend or Ext.define
      if ast
        if ext_extend?(ast)
          cls[:extends] = to_s(ast["arguments"][0])
        elsif ext_define?(ast)
          cfg = ast["arguments"][1]
          if cfg && cfg["type"] == "ObjectExpression"
            v = get_key_value(cfg, "extend")
            cls[:extends] = v ? to_s_value(v) : nil
          end
        end
      end

      return cls
    end

    def get_key_value(obj, key)
      p = obj["properties"].find {|p| to_s_value(p["key"]) == key }
      p ? p["value"] : nil
    end

    def make_method(name, ast=nil)
      return {
        :type => :method,
        :name => name,
        :params => (ast && !empty_fn?(ast)) ? ast["params"].map {|p| to_s(p) } : []
      }
    end

    # Fully serializes the node
    def to_s(ast)
      @serializer.to_s(ast)
    end

    # Does simple serialization where strings serialize into their
    # values (without quotes). Should be called only with Identifier
    # and Literal nodes, but if something else is passed in, we fall
    # back to the real serializer (just in case).
    def to_s_value(ast)
      case ast["type"]
      when "Identifier"
        ast["name"]
      when "Literal"
        ast["value"].is_a?(Hash) ? ast["value"]["regex"].to_s : ast["value"].to_s
      else
        @serializer.to_s(ast)
      end
    end
  end

end

