require "jsduck/util/singleton"
require "jsduck/js/node_array"

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
            events.concat(detect_body(extract_body(node)))
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

      # Extracts all sub-statements and sub-expressions from AST node.
      # Without looking at the type of node, we just take all the
      # sub-hashes and -arrays.
      #
      # A downside of this simple algorithm is that the statements can
      # end up in different order than they are in source code.  For
      # example the IfStatement has three parts in the following
      # order: "test", "consequent", "alternate": But because we're
      # looping over a hash, they might end up in a totally different
      # order.
      def extract_body(node)
        body = []
        node.raw.each_pair do |key, value|
          if key == "type" || key == "range"
            # ignore
          elsif value.is_a?(Array)
            node[key].each {|n| body << n }
          elsif value.is_a?(Hash)
            body << node[key]
          end
        end
        body
      end

    end
  end
end
