require "jsduck/util/singleton"

module JsDuck
  module Js

    # Looks the AST of a FunctionDeclaration or FunctionExpression for
    # calls to methods of the owner class.
    class MethodCalls
      include Util::Singleton

      # Returns array of method names called by the given function.
      # When no methods called, empty array is returned.
      def detect(node)
        @this_map = {
          "this" => true
        }

        detect_body(node["body"]["body"]).sort.uniq
      end

      private

      def detect_body(body_nodes)
        methods = []

        body_nodes.each do |node|
          if method_call?(node)
            methods << node["callee"]["property"].to_s
          end

          if this_var?(node)
            var_name = node["id"].to_s
            @this_map[var_name] = true
          end

          methods.concat(detect_body(node.body))
        end

        methods
      end

      # True when node is this.someMethod() call.
      # Also true for me.someMethod() when me == this.
      def method_call?(node)
        node.call_expression? &&
          node["callee"].member_expression? &&
          node["callee"].raw["computed"] == false &&
          @this_map[node["callee"]["object"].to_s]
      end

      # True when initialization of variable with `this`
      def this_var?(node)
        node.type == "VariableDeclarator" && node["init"].type == "ThisExpression"
      end

    end
  end
end
