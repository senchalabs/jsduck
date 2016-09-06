require "jsduck/util/singleton"

module JsDuck
  module Js

    # Auto-detection of listeners.
    class Listener
      include Util::Singleton

      # Checks if AST node is a listener, and if so, returns doc-hash
      # with listener name and various auto-detected properties.
      # When not an listener returns nil.
	  # Note: currently this is not implemented.  Needs to check for methods under the "listeners:" item
      def detect(ast)
        exp = ast.expression_statement? ? ast["expression"] : nil

        # this.fireEvent("foo", ...)
        if exp && 1==2
          make(exp["arguments"][0].to_value)
        else
          nil
        end
      end

      # Produces a doc-hash for an listener.
      def make(name)
        return {
          :tagname => :listener,
          :name => name,
        }
      end

    end
  end
end
