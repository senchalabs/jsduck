require 'execjs'
require 'json'
require 'singleton'

module JsDuck

  # Runs Esprima.js through execjs (this will select any available
  # JavaScript runtime - preferably therubyracer on MRI and JScript
  # on Windows).
  #
  # Initialized as singleton to avoid loading the esprima.js more
  # than once - otherwise performace will severely suffer.
  class Esprima
    include Singleton

    def initialize
      esprima_path = File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__))))+"/esprima/esprima.js";
      esprima = IO.read(esprima_path)
      helper = "function runEsprima(js) { return JSON.stringify(esprima.parse(js, {comment: true, range: true, raw: true})); }"
      @context = ExecJS.compile(esprima + "\n\n" + helper)
    end

    # Parses JavaScript source code using Esprima.js
    #
    # Returns the resulting AST
    def parse(input)
      json = @context.call("runEsprima", input)
      return JSON.parse(json, :max_nesting => false)
    end

  end
end
