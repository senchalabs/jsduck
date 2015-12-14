require 'jsduck/js/rkelly_adapter'
require 'jsduck/js/associator'
require 'rkelly'

module JsDuck
  module Js

    # A JavaScript parser implementation that uses RKelly and adapts
    # its output to be the same as the old Esprima parser used to
    # produce.
    class Parser
      ADAPTER = Js::RKellyAdapter.new

      def initialize(input, options={})
        @input = input
      end

      # Parses JavaScript source code with RKelly, turns RKelly AST
      # into Esprima AST, and associate comments with syntax nodes.
      def parse
        parser = RKelly::Parser.new
        ast = parser.parse(@input)
        unless ast
          raise syntax_error(parser)
        end

        ast = ADAPTER.adapt(ast)
        # Adjust Program node range
        ast["range"] = [0, @input.length-1]
        return Js::Associator.new(@input).associate(ast)
      end

      def syntax_error(parser)
        token = parser.stopped_at
        if token
          "Invalid JavaScript syntax: Unexpected '#{token.value}' on line #{token.range.from.line}"
        else
          "Invalid JavaScript syntax: Unexpected end of file"
        end
      end
    end

  end
end
