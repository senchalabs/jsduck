require "jsduck/ast_node"

module JsDuck

  # Wraps around array of AST nodes.
  class AstNodeArray
    # Initialized with array of AST Hashes from Esprima.
    def initialize(nodes)
      @nodes = nodes || []
    end

    # Returns a child AST node as AstNode class.
    def [](i)
      AstNode.create(@nodes[i])
    end

    # The length of array
    def length
      @nodes.length
    end

    # Iterates over all the AstNodes in array.
    def each
      @nodes.each {|p| yield(AstNode.create(p)) }
    end

  end

end
