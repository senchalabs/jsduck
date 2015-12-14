require "jsduck/util/singleton"
require "jsduck/js/scoped_traverser"

module JsDuck
  module Js

    # Looks the AST of a FunctionDeclaration or FunctionExpression for
    # uses of this.fireEvent().
    class Fires
      include Util::Singleton

      # Returns array of event names fired by the given function.
      # When no events fired, empty array is returned.
      def detect(function_node)
        @traverser = Js::ScopedTraverser.new

        events = []
        @traverser.traverse(function_node["body"]) do |node|
          if fire_event?(node)
            events << node["arguments"][0].to_value
          end
        end

        events.sort.uniq
      end

      private

      # True when node is this.fireEvent("name") call.
      # Also true for me.fireEvent() when me == this.
      def fire_event?(node)
        node.call_expression? &&
          node["callee"].member_expression? &&
          @traverser.this?(node["callee"]["object"].to_s) &&
          node["callee"]["property"].to_s == "fireEvent" &&
          node["arguments"].length > 0 &&
          node["arguments"][0].value_type == "String"
      end

    end
  end
end
