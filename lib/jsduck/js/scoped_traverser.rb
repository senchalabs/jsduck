module JsDuck
  module Js

    # Traverses syntax tree while keeping track of variables that are
    # bound to `this`.
    class ScopedTraverser
      def initialize
        @this_map = {
          "this" => true
        }
      end

      # Loops recursively over all the sub-nodes of the given node,
      # calling the provided block for each sub-node.
      def traverse(node, &block)
        node.body.each do |child|
          yield child

          if this_var?(child)
            var_name = child["id"].to_s
            @this_map[var_name] = true
          end

          traverse(child, &block)
        end
      end

      # True when variable with given name is bound to `this`.
      def this?(var_name)
        @this_map[var_name]
      end

      private

      # True when initialization of variable with `this`
      def this_var?(node)
        node.type == "VariableDeclarator" && node["init"].type == "ThisExpression"
      end

    end
  end
end
