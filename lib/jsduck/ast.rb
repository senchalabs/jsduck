require "jsduck/serializer"
require "jsduck/evaluator"
require "jsduck/function_ast"
require "jsduck/ext_patterns"

module JsDuck

  # Analyzes the AST produced by EsprimaParser.
  class Ast
    # Should be initialized with EsprimaParser#parse result.
    def initialize(docs = [], options = {})
      @serializer = JsDuck::Serializer.new
      @evaluator = JsDuck::Evaluator.new
      @ext_patterns = JsDuck::ExtPatterns.new(options[:ext_namespaces] || ["Ext"])
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
    def detect(ast)
      ast = ast || {}

      exp = expression?(ast) ? ast["expression"] : nil
      var = var?(ast) ? ast["declarations"][0] : nil

      # Ext.define("Class", {})
      if exp && ext_define?(exp)
        make_class(to_value(exp["arguments"][0]), exp)

      # Ext.override(Class, {})
      elsif exp && ext_override?(exp)
        make_class("", exp)

      # foo = Ext.extend(Parent, {})
      elsif exp && assignment?(exp) && ext_extend?(exp["right"])
        make_class(to_s(exp["left"]), exp["right"])

      # Foo = ...
      elsif exp && assignment?(exp) && class_name?(to_s(exp["left"]))
        make_class(to_s(exp["left"]), exp["right"])

      # var foo = Ext.extend(Parent, {})
      elsif var && var["init"] && ext_extend?(var["init"])
        make_class(to_s(var["id"]), var["init"])

      # var Foo = ...
      elsif var && class_name?(to_s(var["id"]))
        make_class(to_s(var["id"]), var["right"])

      # function Foo() {}
      elsif function?(ast) && ast["id"] && class_name?(to_s(ast["id"]))
        make_class(to_s(ast["id"]))

      # { ... }
      elsif object?(ast)
        make_class("", ast)

      # function foo() {}
      elsif function?(ast)
        make_method(ast["id"] ? to_s(ast["id"]) : "", ast)

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

      # this.fireEvent("foo", ...)
      elsif exp && fire_event?(exp)
        make_event(to_value(exp["arguments"][0]))

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

      # "foo"  (inside some expression)
      elsif string?(ast)
        make_property(to_value(ast))

      # "foo";  (as a statement of it's own)
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
      call?(ast) && ext_pattern?("Ext.define", ast["callee"])
    end

    def ext_extend?(ast)
      call?(ast) && ext_pattern?("Ext.extend", ast["callee"])
    end

    def ext_override?(ast)
      call?(ast) && ext_pattern?("Ext.override", ast["callee"])
    end

    def function?(ast)
      ast["type"] == "FunctionDeclaration" || ast["type"] == "FunctionExpression" || empty_fn?(ast)
    end

    def empty_fn?(ast)
      ast["type"] == "MemberExpression" && ext_pattern?("Ext.emptyFn", ast)
    end

    def ext_pattern?(pattern, ast)
      @ext_patterns.matches?(pattern, to_s(ast))
    end

    def fire_event?(ast)
      call?(ast) && to_s(ast["callee"]) == "this.fireEvent"
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
        if ext_define?(ast)
          detect_ext_define(cls, ast)
        elsif ext_extend?(ast)
          detect_ext_something(:extends, cls, ast)
        elsif ext_override?(ast)
          detect_ext_something(:override, cls, ast)
        elsif object?(ast)
          detect_class_members_from_object(cls, ast)
        elsif ast["type"] == "ArrayExpression"
          detect_class_members_from_array(cls, ast)
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
      cls[:extends] = "Ext.Base"
      cls[:requires] = []
      cls[:uses] = []
      cls[:alternateClassNames] = []
      cls[:mixins] = []
      cls[:aliases] = []
      cls[:members] = []
      cls[:code_type] = :ext_define

      each_pair_in_object_expression(ast["arguments"][1]) do |key, value, pair|
        case key
        when "extend"
          cls[:extends] = make_string(value)
        when "override"
          cls[:override] = make_string(value)
        when "requires"
          cls[:requires] = make_string_list(value)
        when "uses"
          cls[:uses] = make_string_list(value)
        when "alternateClassName"
          cls[:alternateClassNames] = make_string_list(value)
        when "mixins"
          cls[:mixins] = make_mixins(value)
        when "singleton"
          cls[:singleton] = make_singleton(value)
        when "alias"
          cls[:aliases] += make_string_list(value)
        when "xtype"
          cls[:aliases] += make_string_list(value).map {|xtype| "widget."+xtype }
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
          detect_method_or_property(cls, key, value, pair)
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

    def make_string(cfg_value)
      return nil unless cfg_value

      parent = to_value(cfg_value)

      return parent.is_a?(String) ? parent : nil
    end

    def make_string_list(cfg_value)
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

    def make_singleton(cfg_value)
      cfg_value && to_value(cfg_value) == true
    end

    def make_configs(ast, defaults={})
      configs = []

      each_pair_in_object_expression(ast) do |name, value, pair|
        cfg = make_property(name, value, :cfg)
        cfg.merge!(defaults)
        configs << cfg if apply_autodetected(cfg, pair)
      end

      configs
    end

    def make_statics(ast, defaults={})
      statics = []

      each_pair_in_object_expression(ast) do |name, value, pair|
        if function?(value)
          s = make_method(name, value)
        else
          s = make_property(name, value)
        end

        s[:meta] = {:static => true}
        s.merge!(defaults)

        statics << s if apply_autodetected(s, pair, defaults[:inheritable])
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
