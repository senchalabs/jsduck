require "jsduck/util/singleton"
require "jsduck/js/returns"
require "jsduck/js/fires"
require "jsduck/js/method_calls"

module JsDuck
  module Js

    # Auto-detection of methods.
    class Method
      include Util::Singleton

      # Checks if AST node is a method, and if so, returns doc-hash
      # with method name and various auto-detected properties.
      # When not a method returns nil.
      def detect(ast)
        exp = ast.expression_statement? ? ast["expression"] : nil
        var = ast.variable_declaration? ? ast["declarations"][0] : nil

        # function foo() {}
        if ast.function?
          make(ast["id"].to_s || "", ast)

          # foo = function() {}
        elsif exp && exp.assignment_expression? && exp["right"].function?
          make(exp["left"].to_s, exp["right"])

          # var foo = function() {}
        elsif var && var["init"] && var["init"].function?
          make(var["id"].to_s, var["init"])

          # (function() {})
        elsif exp && exp.function?
          make(exp["id"].to_s || "", exp)

          # foo: function() {}
        elsif ast.property? && ast["value"].function?
          make(ast["key"].key_value, ast["value"])

        else
          nil
        end
      end

      # Performs the auto-detection on function AST node and produces
      # a doc-hash.
      def make(name, ast)
        if proper_function?(ast)
          return {
            :tagname => :method,
            :name => name,
            :params => arr_to_nil(params(ast)),
            :chainable => chainable?(ast) && name != "constructor",
            :fires => arr_to_nil(fires(ast)),
            :method_calls => arr_to_nil(method_calls(ast)),
          }
        else
          return {
            :tagname => :method,
            :name => name,
          }
        end
      end

      private

      def proper_function?(ast)
        ast.function? && !ast.ext_empty_fn?
      end

      # replaces empty array with nil
      def arr_to_nil(arr)
        arr.length == 0 ? nil : arr
      end

      def params(ast)
        ast["params"].map {|p| {:name => p.to_s} }
      end

      def chainable?(ast)
        Js::Returns.chainable?(ast.raw)
      end

      def fires(ast)
        Js::Fires.detect(ast)
      end

      def method_calls(ast)
        Js::MethodCalls.detect(ast)
      end

    end
  end
end
