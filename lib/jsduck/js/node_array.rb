require "jsduck/js/node"

module JsDuck
  module Js

    # Wraps around array of AST nodes.
    class NodeArray
      # Initialized with array of AST Hashes from Esprima.
      def initialize(nodes)
        @nodes = nodes || []
      end

      # Returns a child AST node as AstNode class.
      def [](i)
        Js::Node.create(@nodes[i])
      end

      # The length of array
      def length
        @nodes.length
      end

      # Iterates over all the AstNodes in array.
      def each
        @nodes.each {|p| yield(Js::Node.create(p)) }
      end

      # Maps over all the AstNodes in array.
      def map
        @nodes.map {|p| yield(Js::Node.create(p)) }
      end

    end

  end
end
