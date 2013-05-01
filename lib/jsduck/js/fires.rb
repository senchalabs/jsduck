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

        detect_body(node["body"]["body"]).uniq
      end

      private

      def detect_body(body_nodes)
        events = []

        body_nodes.each do |node|
          if fire_event?(node)
            events << extract_event_name(node)
          elsif control_flow?(node)
            events.concat(detect_body(extract_body(node)))
          elsif node.variable_declaration?
            extract_this_vars(node).each do |var_name|
              @this_map[var_name] = true
            end
          end
        end

        events
      end

      # True when node is this.fireEvent("name") call.
      # Also true for me.fireEvent() when me == this.
      def fire_event?(node)
        node.expression_statement? &&
          node["expression"].call_expression? &&
          node["expression"]["callee"].member_expression? &&
          @this_map[node["expression"]["callee"]["object"].to_s] &&
          node["expression"]["callee"]["property"].to_s == "fireEvent" &&
          node["expression"]["arguments"].length > 0 &&
          node["expression"]["arguments"][0].value_type == "String"
      end

      def extract_event_name(node)
        node["expression"]["arguments"][0].to_value
      end

      # Extracts variable names assigned with `this`.
      def extract_this_vars(var)
        mappings = []
        var["declarations"].each do |v|
          if v["init"].type == "ThisExpression"
            mappings << v["id"].to_s
          end
        end
        mappings
      end

      def control_flow?(ast)
        CONTROL_FLOW[ast.type]
      end

      def extract_body(ast)
        body = []
        CONTROL_FLOW[ast.type].each do |name|
          statements = ast[name]
          if statements.is_a?(NodeArray)
            statements.each {|s| body << s }
          else
            body << statements
          end
        end
        body
      end

      CONTROL_FLOW = {
        "IfStatement" => ["consequent", "alternate"],
        "SwitchStatement" => ["cases"],
        "SwitchCase" => ["consequent"],
        "ForStatement" => ["body"],
        "ForInStatement" => ["body"],
        "WhileStatement" => ["body"],
        "DoWhileStatement" => ["body"],
        "TryStatement" => ["block", "handlers", "finalizer"],
        "CatchClause" => ["body"],
        "WithStatement" => ["body"],
        "LabeledStatement" => ["body"],
        "BlockStatement" => ["body"],
      }
    end
  end
end
