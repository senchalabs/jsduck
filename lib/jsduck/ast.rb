require "jsduck/serializer"
require "jsduck/evaluator"
require "jsduck/function_ast"
require "jsduck/ast_node"
require "jsduck/builtins_registry"

module JsDuck

  # Analyzes the AST produced by EsprimaParser.
  class Ast
    # Should be initialized with EsprimaParser#parse result.
    def initialize(docs = [])
      @serializer = JsDuck::Serializer.new
      @evaluator = JsDuck::Evaluator.new
      @docs = docs
    end

    # Performs the detection of code in all docsets.
    #
    # @returns the processed array of docsets. (But it does it
    # destructively by modifying the passed-in docsets.)
    #
    def detect_all!
      # First deal only with doc-comments
      doc_comments = @docs.find_all {|d| d[:type] == :doc_comment }

      # Detect code in each docset.  Sometimes a docset has already
      # been detected as part of detecting some previous docset (like
      # Class detecting all of its configs) - in such case, skip.
      doc_comments.each do |docset|
        code = docset[:code]
        docset[:code] = detect(code) unless code && code[:tagname]
      end

      # Return all doc-comments + other comments for which related
      # code was detected.
      @docs.find_all {|d| d[:type] == :doc_comment || d[:code] && d[:code][:tagname] }
    end

    # Given Esprima-produced syntax tree, detects documentation data.
    #
    # This method is exposed for testing purposes only, JSDuck itself
    # only calls the above #detect_all method.
    #
    # @param ast :code from Result of EsprimaParser
    # @returns Hash consisting of the detected :tagname, :name, and
    # other properties relative to the tag.  Like so:
    #
    #     { :tagname => :method, :name => "foo", ... }
    #
    def detect(node)
      ast = AstNode.new(node)

      exp = ast.expression_statement? ? ast["expression"] : nil
      var = ast.variable_declaration? ? ast["declarations"][0] : nil

      # Ext.define("Class", {})
      if exp && exp.ext_define?
        make_class(exp["arguments"][0].to_value, exp)

      # Ext.override(Class, {})
      elsif exp && exp.ext_override?
        make_class("", exp)

      # foo = Ext.extend(Parent, {})
      elsif exp && exp.assignment_expression? && exp["right"].ext_extend?
        make_class(exp["left"].to_s, exp["right"])

      # Foo = ...
      elsif exp && exp.assignment_expression? && class_name?(exp["left"].to_s)
        make_class(exp["left"].to_s, exp["right"])

      # var foo = Ext.extend(Parent, {})
      elsif var && var["init"].ext_extend?
        make_class(var["id"].to_s, var["init"])

      # var Foo = ...
      elsif var && class_name?(var["id"].to_s)
        make_class(var["id"].to_s, var["right"])

      # function Foo() {}
      elsif ast.function? && class_name?(ast["id"].to_s)
        make_class(ast["id"].to_s)

      # { ... }
      elsif ast.object_expression?
        make_class("", ast)

      # function foo() {}
      elsif ast.function?
        make_method(ast["id"].to_s, ast.raw)

      # foo = function() {}
      elsif exp && exp.assignment_expression? && exp["right"].function?
        make_method(exp["left"].to_s, exp["right"].raw)

      # var foo = function() {}
      elsif var && var["init"] && var["init"].function?
        make_method(var["id"].to_s, var["init"].raw)

      # (function() {})
      elsif exp && exp.function?
        make_method(exp["id"].to_s || "", exp.raw)

      # foo: function() {}
      elsif ast.property? && ast["value"].function?
        make_method(ast["key"].key_value, ast["value"].raw)

      # this.fireEvent("foo", ...)
      elsif exp && exp.fire_event?
        make_event(exp["arguments"][0].to_value)

      # foo = ...
      elsif exp && exp.assignment_expression?
        make_property(exp["left"].to_s, exp["right"].raw)

      # var foo = ...
      elsif var
        make_property(var["id"].to_s, var["init"].raw)

      # foo: ...
      elsif ast.property?
        make_property(ast["key"].key_value, ast["value"].raw)

      # foo;
      elsif exp && exp.identifier?
        make_property(exp.to_s)

      # "foo"  (inside some expression)
      elsif ast.string?
        make_property(ast.to_value)

      # "foo";  (as a statement of it's own)
      elsif exp && exp.string?
        make_property(exp.to_value)

      else
        make_property()
      end
    end

    private

    def function?(ast)
      AstNode.new(ast).function?
    end

    def empty_fn?(ast)
      AstNode.new(ast).ext_empty_fn?
    end

    def object?(ast)
      ast["type"] == "ObjectExpression"
    end

    # Class name begins with upcase char
    def class_name?(name)
      return name.split(/\./).last =~ /\A[A-Z]/
    end

    def make_class(name, ast=nil)
      cls = {
        :tagname => :class,
        :name => name,
      }

      # apply information from Ext.extend, Ext.define, or {}
      if ast
        if ast.ext_define?
          detect_ext_define(cls, ast)
        elsif ast.ext_extend?
          detect_ext_something(:extends, cls, ast.raw)
        elsif ast.ext_override?
          detect_ext_something(:override, cls, ast.raw)
        elsif ast.object_expression?
          detect_class_members_from_object(cls, ast.raw)
        elsif ast.array_expression?
          detect_class_members_from_array(cls, ast.raw)
        end
      end

      return cls
    end

    # Detection of Ext.extend() or Ext.override().
    # The type parameter must be correspondingly either :extend or :override.
    def detect_ext_something(type, cls, ast)
      args = ast["arguments"]
      cls[type] = to_s(args[0])
      if args.length == 2 && object?(args[1])
        detect_class_members_from_object(cls, args[1])
      end
    end

    # Inspects Ext.define() and copies detected properties over to the
    # given cls Hash
    def detect_ext_define(cls, ast)
      # defaults
      cls.merge!(BuiltinsRegistry.ext_define_defaults)
      cls[:members] = []
      cls[:code_type] = :ext_define

      ast["arguments"][1].each_property do |key, value, pair|
        if tag = BuiltinsRegistry.get_ext_define(key)
          tag.parse_ext_define(cls, value)
        else
          case key
          when "config"
            cls[:members] += make_configs(value, {:accessor => true})
          when "cachedConfig"
            cls[:members] += make_configs(value, {:accessor => true})
          when "eventedConfig"
            cls[:members] += make_configs(value, {:accessor => true, :evented => true})
          when "statics"
            cls[:members] += make_statics(value)
          when "inheritableStatics"
            cls[:members] += make_statics(value, {:inheritable => true})
          else
            detect_method_or_property(cls, key, value.raw, pair.raw)
          end
        end
      end
    end

    # Detects class members from object literal
    def detect_class_members_from_object(cls, ast)
      cls[:members] = []
      each_pair_in_object_expression(ast) do |key, value, pair|
        detect_method_or_property(cls, key, value, pair)
      end
    end

    # Detects class members from array literal
    def detect_class_members_from_array(cls, ast)
      cls[:members] = []

      # This will most likely be an @enum class, in which case the
      # enum will be for documentation purposes only.
      cls[:enum] = {:doc_only => true}

      ast["elements"].each do |el|
        detect_method_or_property(cls, key_value(el), el, el)
      end
    end

    # Detects item in object literal either as method or property
    def detect_method_or_property(cls, key, value, pair)
      if function?(value)
        m = make_method(key, value)
        cls[:members] << m if apply_autodetected(m, pair)
      else
        p = make_property(key, value)
        cls[:members] << p if apply_autodetected(p, pair)
      end
    end

    def make_configs(ast, defaults={})
      configs = []

      ast.each_property do |name, value, pair|
        cfg = make_property(name, value.raw, :cfg)
        cfg.merge!(defaults)
        configs << cfg if apply_autodetected(cfg, pair.raw)
      end

      configs
    end

    def make_statics(ast, defaults={})
      statics = []

      ast.each_property do |name, value, pair|
        if value.function?
          s = make_method(name, value.raw)
        else
          s = make_property(name, value.raw)
        end

        s[:meta] = {:static => true}
        s.merge!(defaults)

        statics << s if apply_autodetected(s, pair.raw, defaults[:inheritable])
      end

      statics
    end

    # Sets auto-detection related properties :autodetected and
    # :inheritdoc on the given member Hash.
    #
    # When member has a comment, adds code to the related docset and
    # returns false.
    #
    # Otherwise detects the line number of member and returns true.
    def apply_autodetected(m, ast, inheritable=true)
      docset = find_docset(ast)

      if !docset || docset[:type] != :doc_comment
        if inheritable
          m[:inheritdoc] = {}
        else
          m[:private] = true
        end
        m[:autodetected] = true
      end

      if docset
        docset[:code] = m
        return false
      else
        # Get line number from third place at range array.
        # This third item exists in forked EsprimaJS at
        # https://github.com/nene/esprima/tree/linenr-in-range
        m[:linenr] = ast["range"][2]
        return true
      end
    end

    # Looks up docset associated with given AST node.
    # A dead-stupid and -slow implementation, but works.
    def find_docset(ast)
      @docs.find do |docset|
        docset[:code] == ast
      end
    end

    def make_method(name, ast=nil)
      return {
        :tagname => :method,
        :name => name,
        :params => make_params(ast),
        :chainable => chainable?(ast) && name != "constructor",
      }
    end

    def make_params(ast)
      if ast && !empty_fn?(ast)
        ast["params"].map {|p| {:name => to_s(p)} }
      else
        []
      end
    end

    def chainable?(ast)
      if function?(ast) && !empty_fn?(ast)
        FunctionAst.return_types(ast) == [:this]
      else
        false
      end
    end

    def make_event(name)
      return {
        :tagname => :event,
        :name => name,
      }
    end

    def make_property(name=nil, ast=nil, tagname=:property)
      return {
        :tagname => tagname,
        :name => name,
        :type => make_value_type(ast),
        :default => make_default(ast),
      }
    end

    def make_default(ast)
      ast && to_value(ast) != nil ? to_s(ast) : nil
    end

    def make_value_type(ast)
      if ast
        v = to_value(ast)
        if v.is_a?(String)
          "String"
        elsif v.is_a?(Numeric)
          "Number"
        elsif v.is_a?(TrueClass) || v.is_a?(FalseClass)
          "Boolean"
        elsif v.is_a?(Array)
          "Array"
        elsif v.is_a?(Hash)
          "Object"
        elsif v == :regexp
          "RegExp"
        else
          nil
        end
      else
        nil
      end
    end

    # -- various helper methods --

    # Iterates over keys and values in ObjectExpression.  The keys
    # are turned into strings, but values are left as is for further
    # processing.
    def each_pair_in_object_expression(ast)
      return unless ast && object?(ast)

      ast["properties"].each do |p|
        yield(key_value(p["key"]), p["value"], p)
      end
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
