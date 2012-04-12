require 'v8'
require 'json'
require 'singleton'

module JsDuck

  # New parser prototype that uses Esprima.js through V8.
  class EsprimaParser
    # Initialize as singleton to avoid loading the esprima.js more
    # than once - otherwise performace will severely suffer.
    include Singleton

    def initialize
      @v8 = V8::Context.new
      esprima = File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__))))+"/esprima/esprima.js";
      @v8.load(esprima)
    end

    # Input must be a String.
    def parse(input)
      @v8['js'] = @input = input

      json = @v8.eval("JSON.stringify(esprima.parse(js, {comment: true, range: true}))")
      @ast = JSON.parse(json, :max_nesting => false)

      @ast["comments"] = merge_comments(@ast["comments"])
      locate_comments
    end

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
    # they are separated only by whitespace
    def mergeable?(c1, c2)
      if c1["type"] == "Line" && c2["type"] == "Line"
        /\A\s*\Z/ =~ @input.slice((c1["range"][1]+1)..(c2["range"][0]-1))
      else
        false
      end
    end

    def locate_comments
      @ast["comments"].map do |comment|
        {
          :comment => comment["value"],
          :code => stuff_after(comment)
        }
      end
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
      return a[1] < b[0]
    end

    # True if range A is greater than range B
    def greater(a, b)
      return a[0] > b[1]
    end

    # True if range A is within range B
    def within(a, b)
      return b[0] < a[0] && a[1] < b[1]
    end


    # Returns array of child nodes of given node
    def child_nodes(node)
      properties = NODE_TYPES[node["type"]]

      unless properties
        puts "Unknown node type: "+node["type"]
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
