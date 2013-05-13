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
