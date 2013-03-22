require 'execjs'
require 'jsduck/util/json'
require 'jsduck/util/singleton'

module JsDuck

  # Runs Esprima.js through JavaScript runtime selected by ExecJS.
  # Normally this will be V8 engine within therubyracer gem, but when
  # JSDuck is installed through some other means than rubygems, then
  # one could use any of the runtimes supported by ExecJS.  (NodeJS
  # for example.)
  #
  # Initialized as singleton to avoid loading the esprima.js more
  # than once - otherwise performace will severely suffer.
  class Esprima
    include Util::Singleton

    def initialize
      esprima_path = File.dirname(File.expand_path(__FILE__)) + "/esprima/esprima.js"
      esprima = IO.read(esprima_path)

      # Esprima attempts to assign to window.esprima, but our v8
      # engine has no global window variable defined.  So define our
      # own and then grab esprima out from it again.
      source = <<-EOJS
        if (typeof window === "undefined") {
            var window = {};
        }

        #{esprima}

        var esprima = window.esprima;

        function runEsprima(js) {
          return JSON.stringify(esprima.parse(js, {comment: true, range: true, raw: true}));
        }
      EOJS

      @context = ExecJS.compile(source)
    end

    # Parses JavaScript source code using Esprima.js
    #
    # Returns the resulting AST
    def parse(input)
      json = @context.call("runEsprima", input)
      return Util::Json.parse(json, :max_nesting => false)
    end

  end
end
