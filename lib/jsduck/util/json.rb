require 'jsduck/util/singleton'
require 'jsduck/util/io'
require 'jsduck/logger'
require 'json'

module JsDuck
  module Util

    # Wrapper around the json gem for use in JsDuck.
    #
    # The main benefit of it is that we have a central place for
    # controlling how the JSON is created (pretty-formatted or not).
    class Json
      include Util::Singleton

      def initialize
        @pretty = false
      end

      # Set to true to turn on pretty-formatting of JSON
      def pretty=(pretty)
        @pretty = pretty
      end

      # Turns object into JSON, places it inside JavaScript that calls the
      # given callback name, and writes the result to file.
      def write_jsonp(filename, callback_name, data)
        jsonp = "Ext.data.JsonP['" + callback_name + "'](" + generate(data) + ");"
        File.open(filename, 'w') {|f| f.write(jsonp) }
      end

      # Turns object into JSON and writes inside a file
      def write_json(filename, data)
        File.open(filename, 'w') {|f| f.write(generate(data)) }
      end

      # Generates JSON from object
      def generate(data)
        @pretty ? JSON.pretty_generate(data) : JSON.generate(data)
      end

      # Reads and parses JSON from file
      def read(filename)
        begin
          parse(Util::IO.read(filename))
        rescue
          Logger.fatal("#{filename} is not a valid JSON file")
          exit(1)
        end
      end

      # Parses JSON string
      def parse(string, opts = {})
        JSON.parse(string, opts)
      end

    end

  end
end
