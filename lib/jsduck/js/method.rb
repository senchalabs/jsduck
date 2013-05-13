require "jsduck/util/singleton"
require "jsduck/js/returns"
require "jsduck/js/fires"
require "jsduck/js/method_calls"

module JsDuck
  module Js

    class Method
      include Util::Singleton

      # Detects various properties of a method from AST node and
      # returns a documentation hash with these and method name.
      def detect(name, ast)
        return {
          :tagname => :method,
          :name => name,
          :params => empty_array_to_nil(make_params(ast)),
          :chainable => chainable?(ast) && name != "constructor",
          :fires => empty_array_to_nil(detect_fires(ast)),
          :method_calls => empty_array_to_nil(detect_method_calls(ast)),
        }
      end

      private

      def empty_array_to_nil(arr)
        arr.length == 0 ? nil : arr
      end

      def make_params(ast)
        if proper_function?(ast)
          ast["params"].map {|p| {:name => p.to_s} }
        else
          []
        end
      end

      def chainable?(ast)
        if proper_function?(ast)
          Js::Returns.chainable?(ast.raw)
        else
          false
        end
      end

      def detect_fires(ast)
        if proper_function?(ast)
          Js::Fires.detect(ast)
        else
          []
        end
      end

      def detect_method_calls(ast)
        if proper_function?(ast)
          Js::MethodCalls.detect(ast)
        else
          []
        end
      end

      def proper_function?(ast)
        ast.function? && !ast.ext_empty_fn?
      end

    end
  end
end
