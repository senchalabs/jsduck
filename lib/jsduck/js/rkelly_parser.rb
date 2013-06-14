require 'jsduck/js/rkelly_adapter'
require 'jsduck/js/associator'
require 'rkelly'

module JsDuck
  module Js

    # An alternative JsDuck::Js::Parser implementation that uses
    # RKelly instead of Esprima.
    class RKellyParser
      RKELLY = RKelly::Parser.new
      ADAPTER = Js::RKellyAdapter.new

      def initialize(input, options={})
        @input = input
      end

      # Parses JavaScript source code with RKelly, turns RKelly AST
      # into Esprima AST, and associate comments with syntax nodes.
      def parse
        ast = RKelly::Parser.new.parse(@input)
        ast = ADAPTER.adapt(ast)
        # Adjust Program node range
        ast["range"] = [0, @input.length-1]
        return Js::Associator.new(@input).associate(ast)
      end
    end

  end
end
