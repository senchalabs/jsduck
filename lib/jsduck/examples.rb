require 'jsduck/json_duck'
require 'jsduck/null_object'

module JsDuck

  # Reads in examples JSON file
  class Examples
    # Creates Examples object from filename.
    def self.create(filename)
      if filename
        Examples.new(filename)
      else
        NullObject.new(:to_array => [])
      end
    end

    # Parses examples config file
    def initialize(filename)
      @examples = JsonDuck.read(filename)
    end

    # Writes examples JSON file to dir
    def write(dir)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      # Write the JSON to output dir, so it's available in released
      # version of docs and people can use it with JSDuck by themselves.
      JsonDuck.write_json(dir+"/examples.json", @examples)
    end

    # Returns all examples as array
    def to_array
      @examples
    end

  end

end
