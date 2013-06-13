require 'jsduck/js/esprima'
require 'jsduck/js/associator'

module JsDuck
  module Js

    # JavaScript parser that internally uses Esprima.js
    class Parser

      # Initializes the parser with JavaScript source code to be parsed.
      def initialize(input, options = {})
        @input = input
      end

      # Parses JavaScript source code and associates comments with AST
      # nodes, returning array of docsets.
      def parse
        ast = Js::Esprima.parse(@input)
        Js::Associator.new(@input).associate(ast)
      end

    end

  end
end
