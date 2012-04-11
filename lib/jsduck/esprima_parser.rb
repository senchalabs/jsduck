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

      locate_comments
    end

    def locate_comments
      @ast["comments"].map do |comment|
        {
          :comment => comment["value"],
          :code => stuff_after(comment["range"])
        }
      end
    end

    # Sees if there is some code following the comment at specified
    # range.  Returns the code found.  But if the comment is instead
    # followed by another comment, returns nil.
    def stuff_after(range)
      code = code_after(range)
      comment = comment_after(range)
      if code && comment
        return code["range"][0] < comment["range"][0] ? code : nil
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

    # Looks for comment following the given range
    def comment_after(range)
      @ast["comments"].each do |item|
        if range[1] < item["range"][0]
          return item
        end
      end
      return nil
    end

  end
end
