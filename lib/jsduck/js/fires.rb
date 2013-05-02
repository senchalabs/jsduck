require "jsduck/util/singleton"

module JsDuck
  module Js

    # Looks the AST of a FunctionDeclaration or FunctionExpression for
    # uses of this.fireEvent().
    class Fires
      include Util::Singleton

      # Returns array of event names fired by the given function.
      # When no events fired, empty array is returned.
      def detect(node)
        @this_map = {
          "this" => true
        }

        detect_body(node["body"]["body"]).sort.uniq
      end

      private

      def detect_body(body_nodes)
        events = []

        body_nodes.each do |node|
          if fire_event?(node)
            events << node["arguments"][0].to_value
          elsif this_var?(node)
            var_name = node["id"].to_s
            @this_map[var_name] = true
          else
            events.concat(detect_body(node.body))
          end
        end

        events
      end

      # True when node is this.fireEvent("name") call.
      # Also true for me.fireEvent() when me == this.
      def fire_event?(node)
        node.call_expression? &&
          node["callee"].member_expression? &&
          @this_map[node["callee"]["object"].to_s] &&
          node["callee"]["property"].to_s == "fireEvent" &&
          node["arguments"].length > 0 &&
          node["arguments"][0].value_type == "String"
      end

      # True when initialization of variable with `this`
      def this_var?(node)
        node.type == "VariableDeclarator" && node["init"].type == "ThisExpression"
      end

    end
  end
end
