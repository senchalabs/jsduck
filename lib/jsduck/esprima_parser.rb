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
      @v8['js'] = input

      json = @v8.eval("JSON.stringify(esprima.parse(js, {comment: true, range: true}))")
      @ast = JSON.parse(json, :max_nesting => false)

      link_comments
      locate_comments
    end

    # Establishes links between comments, so we can easily use
    # comment["next"] to get to the next comment.
    def link_comments
      @ast["comments"].each_with_index do |comment, i|
        comment["next"] = @ast["comments"][i+1]
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

    # Returns array of child nodes of given node
    def child_nodes(node)
      case node["type"]
      when "Program", "BlockStatement"
        node["body"]
      when "FunctionDeclaration"
        # Always contains just a single BlockStatement,
        # so we just directly to the body of that.
        node["body"]["body"]
      else
        puts "Unknown node type: "+node["type"]
      end
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
  end
end
