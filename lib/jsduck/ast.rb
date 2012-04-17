require "jsduck/serializer"
require "jsduck/evaluator"

module JsDuck

  # Analyzes the AST produced by EsprimaParser.
  class Ast
    def initialize
      @serializer = JsDuck::Serializer.new
      @evaluator = JsDuck::Evaluator.new
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
        make_class(to_value(exp["arguments"][0]), exp)

      # foo = Ext.extend("Parent", {})
      elsif exp && assignment?(exp) && ext_extend?(exp["right"])
        make_class(to_s(exp["left"]), exp["right"])

      # Foo = ...
      elsif exp && assignment?(exp) && class_name?(to_s(exp["left"]))
        make_class(to_s(exp["left"]))

      # var foo = Ext.extend("Parent", {})
      elsif var && var["init"] && ext_extend?(var["init"])
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
      elsif var && var["init"] && function?(var["init"])
        make_method(to_s(var["id"]), var["init"])

      # (function() {})
      elsif exp && function?(exp)
        make_method(exp["id"] ? to_s(exp["id"]) : "", exp)

      # foo: function() {}
      elsif property?(ast) && function?(ast["value"])
        make_method(key_value(ast["key"]), ast["value"])

      # foo = ...
      elsif exp && assignment?(exp)
        make_property(to_s(exp["left"]), exp["right"])

      # var foo = ...
      elsif var
        make_property(to_s(var["id"]), var["init"])

      # foo: ...
      elsif property?(ast)
        make_property(key_value(ast["key"]), ast["value"])

      # foo;
      elsif exp && ident?(exp)
        make_property(to_s(exp))

      # "foo";
      elsif exp && string?(exp)
        make_property(to_value(exp))

      else
        make_property()
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

    def ident?(ast)
      ast["type"] == "Identifier"
    end

    def string?(ast)
      ast["type"] == "Literal" && ast["value"].is_a?(String)
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
          cfg = object_expression_to_hash(ast["arguments"][1])

          cls[:extends] = make_extends(cfg["extend"])
          cls[:requires] = make_requires(cfg["requires"])
          cls[:uses] = make_requires(cfg["uses"])
          cls[:mixins] = make_mixins(cfg["mixins"])
        end
      end

      return cls
    end

    def make_extends(cfg_value)
      return nil unless cfg_value

      parent = to_value(cfg_value)

      return parent.is_a?(String) ? parent : nil
    end

    def make_requires(cfg_value)
      return [] unless cfg_value

      classes = Array(to_value(cfg_value))

      return classes.all? {|c| c.is_a? String } ? classes : []
    end

    def make_mixins(cfg_value)
      return [] unless cfg_value

      v = to_value(cfg_value)
      classes = v.is_a?(Hash) ? v.values : Array(v)

      return classes.all? {|c| c.is_a? String } ? classes : []
    end

    def make_method(name, ast=nil)
      return {
        :type => :method,
        :name => name,
        :params => make_params(ast)
      }
    end

    def make_params(ast)
      if ast && !empty_fn?(ast)
        ast["params"].map {|p| {:name => to_s(p)} }
      else
        []
      end
    end

    def make_property(name=nil, ast=nil)
      return {
        :type => :property,
        :name => name,
      }
    end

    # -- various helper methods --

    # Turns ObjectExpression into Ruby Hash for easy lookup.  The keys
    # are turned into strings, but values are left as is for further
    # processing.
    def object_expression_to_hash(ast)
      h = {}
      if ast && ast["type"] == "ObjectExpression"
        ast["properties"].each do |p|
          h[key_value(p["key"])] = p["value"]
        end
      end
      return h
    end

    # Converts object expression property key to string value
    def key_value(key)
      @evaluator.key_value(key)
    end

    # Fully serializes the node
    def to_s(ast)
      @serializer.to_s(ast)
    end

    # Converts AST node into a value.
    def to_value(ast)
      begin
        @evaluator.to_value(ast)
      rescue
        nil
      end
    end
  end

end

