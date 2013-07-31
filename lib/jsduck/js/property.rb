require "jsduck/util/singleton"

module JsDuck
  module Js

    # Auto-detection of properties.
    class Property
      include Util::Singleton

      # Checks if AST node is a property, and if so, returns doc-hash
      # with property name and various auto-detected attributes.
      # When not a property returns nil.
      def detect(ast)
        exp = ast.expression_statement? ? ast["expression"] : nil
        var = ast.variable_declaration? ? ast["declarations"][0] : nil

        # foo = ...
        if exp && exp.assignment_expression?
          make(exp["left"].to_s, exp["right"])

          # var foo = ...
        elsif var
          make(var["id"].to_s, var["init"])

          # foo: ...
        elsif ast.property?
          make(ast["key"].key_value, ast["value"])

          # foo;
        elsif exp && exp.identifier?
          make(exp.to_s)

          # "foo"  (inside some expression)
        elsif ast.string?
          make(ast.to_value)

          # "foo";  (as a statement of it's own)
        elsif exp && exp.string?
          make(exp.to_value)

          # Object.defineProperty(obj, "prop", {value: x})
        elsif exp && exp.define_property?
          name = exp["arguments"][1].to_value
          make(name, exp.value_of_define_property)

        else
          nil
        end
      end

      # Produces a doc-hash for a property.
      def make(name=nil, ast=nil)
        return {
          :tagname => :property,
          :name => name,
          :type => ast && ast.value_type,
          :default => ast && default(ast),
        }
      end

      private

      def default(ast)
        ast.to_value != nil ? ast.to_s : nil
      end

      def value_from_descriptor(descriptor)
        descriptor.each_property do |key, value, prop|
          return value if key == "value"
        end
      end

    end
  end
end
