require 'v8'
require 'json'
require 'singleton'

module JsDuck

  # Generates AST from JavaScript code by running Esprima.js through V8.
  #
  # Initialized as singleton to avoid loading the esprima.js more
  # than once - otherwise performace will severely suffer.
  class EsprimaCore
    include Singleton

    def initialize
      @v8 = V8::Context.new
      esprima = File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__))))+"/esprima/esprima.js";
      @v8.load(esprima)
      @v8.eval(<<-EOS)
        function adjustRegexLiteral(key, value) {
            if (key === 'value' && value instanceof RegExp) {
                value = {regex: value.toString()};
            }
            return value;
        }
      EOS
    end

    # Parses JavaScript source code using Esprima.js
    #
    # Returns the resulting AST
    def parse(input)
      @v8['js'] = input
      json = @v8.eval("JSON.stringify(esprima.parse(js, {comment: true, range: true}), adjustRegexLiteral)")
      return JSON.parse(json, :max_nesting => false)
    end

  end
end
