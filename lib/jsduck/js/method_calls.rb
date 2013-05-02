require "jsduck/util/singleton"
require "jsduck/js/scoped_traverser"

module JsDuck
  module Js

    # Looks the AST of a FunctionDeclaration or FunctionExpression for
    # calls to methods of the owner class.
    class MethodCalls
      include Util::Singleton

      # Returns array of method names called by the given function.
      # When no methods called, empty array is returned.
      def detect(function_node)
        @traverser = Js::ScopedTraverser.new

        methods = []
        @traverser.traverse(function_node["body"]) do |node|
          if method_call?(node)
            methods << node["callee"]["property"].to_s
          end
        end

        methods.sort.uniq
      end

      private

      # True when node is this.someMethod() call.
      # Also true for me.someMethod() when me == this.
      def method_call?(node)
        node.call_expression? &&
          node["callee"].member_expression? &&
          node["callee"].raw["computed"] == false &&
          @traverser.this?(node["callee"]["object"].to_s)
      end

    end
  end
end
