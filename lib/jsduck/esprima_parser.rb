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
      code = code_after(comment["range"])
      if code && comment["next"]
        return code["range"][0] < comment["next"]["range"][0] ? code : nil
      else
        code
      end
    end

    # Looks for code following the given range
    def code_after(range)
      @ast["body"].each do |item|
        if range[1] < item["range"][0]
          return item
        end
      end
      return nil
    end

  end
end
