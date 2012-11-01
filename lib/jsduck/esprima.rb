require 'v8'
require 'jsduck/util/json'
require 'jsduck/util/singleton'

module JsDuck

  # Runs Esprima.js through V8.
  #
  # Initialized as singleton to avoid loading the esprima.js more
  # than once - otherwise performace will severely suffer.
  class Esprima
    include Util::Singleton

    def initialize
      @v8 = V8::Context.new
      esprima = File.dirname(File.expand_path(__FILE__))+"/esprima/esprima.js";

      # Esprima attempts to assign to window.esprima, but our v8
      # engine has no global window variable defined.  So define our
      # own and then grab esprima out from it again.
      @v8.eval("var window = {};")
      @v8.load(esprima)
      @v8.eval("var esprima = window.esprima;")
    end

    # Parses JavaScript source code using Esprima.js
    #
    # Returns the resulting AST
    def parse(input)
      @v8['js'] = input
      json = @v8.eval("JSON.stringify(esprima.parse(js, {comment: true, range: true, raw: true}))")
      return Util::Json.parse(json, :max_nesting => false)
    end

  end
end
