require "jsduck/util/singleton"
require "jsduck/tag_registry"
require "jsduck/js/method"
require "jsduck/js/property"

module JsDuck
  module Js

    # Auto-detection of classes.
    class Class
      include Util::Singleton

      # Checks if AST node is a class, and if so, returns doc-hash
      # with clas name and various auto-detected attributes.
      # When not a class returns nil.
      def detect(ast, docs)
        @docs = docs

        exp = ast.expression_statement? ? ast["expression"] : nil
        var = ast.variable_declaration? ? ast["declarations"][0] : nil

        # Ext.define("Class", {})
        if exp && exp.ext_define?
          make(exp["arguments"][0].to_value, exp)

          # Ext.override(Class, {})
        elsif exp && exp.ext_override?
          make("", exp)

          # foo = Ext.extend(Parent, {})
        elsif exp && exp.assignment_expression? && exp["right"].ext_extend?
          make(exp["left"].to_s, exp["right"])

          # Foo = ...
        elsif exp && exp.assignment_expression? && class_name?(exp["left"].to_s)
          make(exp["left"].to_s, exp["right"])

          # var foo = Ext.extend(Parent, {})
        elsif var && var["init"].ext_extend?
          make(var["id"].to_s, var["init"])

          # var Foo = ...
        elsif var && class_name?(var["id"].to_s)
          make(var["id"].to_s, var["right"])

          # function Foo() {}
        elsif ast.function? && class_name?(ast["id"].to_s || "")
          make(ast["id"].to_s)

          # { ... }
        elsif ast.object_expression?
          make("", ast)

        else
          nil
        end
      end

      # Produces a doc-hash for a class.
      def make(name, ast=nil)
        cls = {
          :tagname => :class,
          :name => name,
        }

        # apply information from Ext.extend, Ext.define, or {}
        if ast
          if ast.ext_define?
            detect_ext_define(cls, ast)
          elsif ast.ext_extend?
            detect_ext_something(:extends, cls, ast)
          elsif ast.ext_override?
            detect_ext_something(:override, cls, ast)
          elsif ast.object_expression?
            detect_class_members_from_object(cls, ast)
          elsif ast.array_expression?
            detect_class_members_from_array(cls, ast)
          end
        end

        return cls
      end

      private

      # Class name begins with upcase char
      def class_name?(name)
        return name.split(/\./).last =~ /\A[A-Z]/
      end

      # Detection of Ext.extend() or Ext.override().
      # The type parameter must be correspondingly either :extend or :override.
      def detect_ext_something(type, cls, ast)
        args = ast["arguments"]
        cls[type] = args[0].to_s
        if args.length == 2 && args[1].object_expression?
          detect_class_members_from_object(cls, args[1])
        end
      end

      # Inspects Ext.define() and copies detected properties over to the
      # given cls Hash
      def detect_ext_define(cls, ast)
        # defaults
        cls.merge!(TagRegistry.ext_define_defaults)
        cls[:members] = []
        cls[:code_type] = :ext_define

        ast["arguments"][1].each_property do |key, value, pair|
          if tag = TagRegistry.get_by_ext_define_pattern(key)
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
              detect_method_or_property(cls, key, value, pair)
            end
          end
        end
      end

      # Detects class members from object literal
      def detect_class_members_from_object(cls, ast)
        cls[:members] = []
        ast.each_property do |key, value, pair|
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
          detect_method_or_property(cls, el.key_value, el, el)
        end
      end

      # Detects item in object literal either as method or property
      def detect_method_or_property(cls, key, value, pair)
        member = value.function? ? make_method(key, value) : make_property(key, value)
        cls[:members] << member if apply_autodetected(member, pair)
      end

      def make_configs(ast, defaults={})
        configs = []

        ast.each_property do |name, value, pair|
          cfg = make_property(name, value)
          cfg[:tagname] = :cfg
          cfg.merge!(defaults)
          configs << cfg if apply_autodetected(cfg, pair)
        end

        configs
      end

      def make_statics(ast, defaults={})
        statics = []

        ast.each_property do |name, value, pair|
          if value.function?
            s = make_method(name, value)
          else
            s = make_property(name, value)
          end

          s[:static] = true
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
        docset = find_docset(ast.raw)

        if !docset || docset[:type] != :doc_comment
          if inheritable
            m[:inheritdoc] = {}
          else
            m[:private] = true
          end
          m[:autodetected] = {:tagname => m[:tagname]}
        end

        if docset
          docset[:code] = m
          return false
        else
          m[:linenr] = ast.linenr
          return true
        end
      end

      # Looks up docset associated with given AST node.
      # A dead-stupid and -slow implementation, but works.
      #
      # The comparison needs to be done between raw AST nodes - multiple
      # Node instances can be created to wrap a single raw AST node,
      # and they will then not be equal.
      def find_docset(raw_ast)
        @docs.find do |docset|
          docset[:code] == raw_ast
        end
      end

      def make_method(name, ast)
        Js::Method.make(name, ast)
      end

      def make_property(name=nil, ast=nil)
        Js::Property.make(name, ast)
      end

    end
  end
end
