require 'jsduck/json_duck'

module JsDuck

  # Reads in examples JSON file
  class Examples
    def initialize
      @examples = []
    end

    # Parses examples config file
    def parse(filename)
      @examples = JsonDuck.read(filename)
    end

    # Writes examples JSON file to dir
    def write(dir)
      return if @examples.length == 0

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
