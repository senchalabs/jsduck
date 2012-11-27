require 'jsduck/esprima'
require 'jsduck/logger'

module JsDuck

  # JavaScript parser that internally uses Esprima.js
  class JsParser

    # Initializes the parser with JavaScript source code to be parsed.
    def initialize(input, options = {})
      @input = input

      # Initialize line number counting
      @start_index = 0
      @start_linenr = 1
    end

    # Parses JavaScript source code and returns array of hashes like this:
    #
    #     {
    #         :comment => "The contents of the comment",
    #         :code => {...AST data structure for code following the comment...},
    #         :linenr => 12,  // Beginning with 1
    #         :type => :doc_comment, // or :plain_comment
    #     }
    #
    def parse
      @ast = Esprima.parse(@input)

      @ast["comments"] = merge_comments(@ast["comments"])
      locate_comments
    end

    private

    # Merges consecutive line-comments and Establishes links between
    # comments, so we can easily use comment["next"] to get to the
    # next comment.
    def merge_comments(original_comments)
      result = []

      comment = original_comments[0]
      i = 0

      while comment
        i += 1
        next_comment = original_comments[i]

        if next_comment && mergeable?(comment, next_comment)
          # Merge next comment to current one
          comment["value"] += "\n" + next_comment["value"]
          comment["range"][1] = next_comment["range"][1]
        else
          # Create a link and continue with next comment
          comment["next"] = next_comment
          result << comment
          comment = next_comment
        end
      end

      result
    end

    # Two comments can be merged if they are both line-comments and
    # they are separated only by whitespace (only one newline at the
    # end of the first comment is allowed)
    def mergeable?(c1, c2)
      if c1["type"] == "Line" && c2["type"] == "Line"
        /\A(\r\n|\n|\r)?[ \t]*\Z/ =~ @input.slice((c1["range"][1])..(c2["range"][0]-1))
      else
        false
      end
    end

    def locate_comments
      @ast["comments"].map do |comment|
        # Detect comment type and strip * at the beginning of doc-comment
        value = comment["value"]
        if comment["type"] == "Block" && value =~ /\A\*/
          type = :doc_comment
          value = value.slice(1, value.length-1)
        else
          type = :plain_comment
        end

        {
          :comment => value,
          :code => stuff_after(comment),
          :linenr => line_number(comment["range"][0]),
          :type => type,
        }
      end
    end

    # Given index inside input string, returns the corresponding line number
    def line_number(index)
      # To speed things up, remember the index until which we counted,
      # then next time just begin counting from there.  This way we
      # only count each line once.
      @start_linenr = @input[@start_index...index].count("\n") + @start_linenr
      @start_index = index
      return @start_linenr
    end

    # Sees if there is some code following the comment.
    # Returns the code found.  But if the comment is instead
    # followed by another comment, returns nil.
    def stuff_after(comment)
      code = code_after(comment["range"], @ast)
      if code && comment["next"]
        return code["range"][0] < comment["next"]["range"][0] ? code : nil
      else
        code
      end
    end

    # Looks for code following the given range.
    #
    # The second argument is the parent node within which we perform
    # our search.
    def code_after(range, parent)
      # Look through all child nodes of parent...
      child_nodes(parent).each do |node|
        if less(range, node["range"])
          # If node is after our range, then that's it.  There could
          # be comments in our way, but that's taken care of in
          # #stuff_after method.
          return node
        elsif within(range, node["range"])
          # Our range is within the node --> recurse
          return code_after(range, node)
        end
      end

      return nil
    end


    # True if range A is less than range B
    def less(a, b)
      return a[1] <= b[0]
    end

    # True if range A is greater than range B
    def greater(a, b)
      return a[0] >= b[1]
    end

    # True if range A is within range B
    def within(a, b)
      return b[0] <= a[0] && a[1] <= b[1]
    end


    # Returns array of child nodes of given node
    def child_nodes(node)
      properties = NODE_TYPES[node["type"]]

      unless properties
        Logger.fatal("Unknown node type: "+node["type"])
        exit(1)
      end

      properties.map {|p| node[p] }.compact.flatten
    end

    # All possible node types in Esprima-created abstract syntax tree
    #
    # Each node type maps to list of properties of that node into
    # which we can recurse for further parsing.
    NODE_TYPES = {
      "Program" => ["body"],

      "BlockStatement" => ["body"],
      "BreakStatement" => [],
      "ContinueStatement" => [],
      "DoWhileStatement" => ["body", "test"],
      "DebuggerStatement" => [],
      "EmptyStatement" => [],
      "ExpressionStatement" => ["expression"],
      "ForStatement" => ["init", "test", "update", "body"],
      "ForInStatement" => ["left", "right", "body"],
      "IfStatement" => ["test", "consequent", "alternate"],
      "LabeledStatement" => ["body"],
      "ReturnStatement" => ["argument"],
      "SwitchStatement" => ["discriminant", "cases"],
      "SwitchCase" => ["test", "consequent"],
      "ThrowStatement" => ["argument"],
      "TryStatement" => ["block", "handlers", "finalizer"],
      "CatchClause" => ["param", "body"],
      "WhileStatement" => ["test", "body"],
      "WithStatement" => ["object", "body"],

      "FunctionDeclaration" => ["id", "params", "body"],
      "VariableDeclaration" => ["declarations"],
      "VariableDeclarator" => ["id", "init"],

      "AssignmentExpression" => ["left", "right"],
      "ArrayExpression" => ["elements"],
      "BinaryExpression" => ["left", "right"],
      "CallExpression" => ["callee", "arguments"],
      "ConditionalExpression" => ["test", "consequent", "alternate"],
      "FunctionExpression" => ["body"],

      "LogicalExpression" => ["left", "right"],
      "MemberExpression" => ["object", "property"],
      "NewExpression" => ["callee", "arguments"],
      "ObjectExpression" => ["properties"],
      "Property" => ["key", "value"],

      "SequenceExpression" => ["expressions"],
      "ThisExpression" => [],
      "UnaryExpression" => ["argument"],
      "UpdateExpression" => ["argument"],

      "Identifier" => [],
      "Literal" => [],
    }

  end
end
