require 'jsduck/io'
require 'jsduck/logger'
require 'json'

module JsDuck

  # Wrapper around the json gem for use in JsDuck.
  #
  # The main benefit of it is that we have a central place for
  # controlling how the JSON is created (pretty-formatted or not).
  class JsonDuck
    @@pretty = false

    # Set to true to turn on pretty-formatting of JSON
    def self.pretty=(pretty)
      @@pretty = pretty
    end

    # Turns object into JSON, places it inside JavaScript that calls the
    # given callback name, and writes the result to file.
    def self.write_jsonp(filename, callback_name, data)
      jsonp = "Ext.data.JsonP['" + callback_name + "'](" + self.generate(data) + ");"
      File.open(filename, 'w') {|f| f.write(jsonp) }
    end

    # Turns object into JSON and writes inside a file
    def self.write_json(filename, data)
      File.open(filename, 'w') {|f| f.write(self.generate(data)) }
    end

    # Generates JSON from object
    def self.generate(data)
      @@pretty ? JSON.pretty_generate(data) : JSON.generate(data)
    end

    # Reads and parses JSON from file
    def self.read(filename)
      begin
        self.parse(JsDuck::IO.read(filename))
      rescue
        Logger.instance.fatal("#{filename} is not a valid JSON file")
        exit(1)
      end
    end

    # Parses JSON string
    def self.parse(string)
      JSON.parse(string)
    end
  end

end
