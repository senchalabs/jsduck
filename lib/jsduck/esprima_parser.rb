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

      json = @v8.eval("JSON.stringify(esprima.parse(js, {comment: true, loc: true}))")
      JSON.parse(json, :max_nesting => false)
    end

  end
end
