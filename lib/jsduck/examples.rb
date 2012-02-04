require 'jsduck/json_duck'
require 'jsduck/null_object'

module JsDuck

  # Reads in examples JSON file
  class Examples
    # Creates Examples object from filename.
    def self.create(filename, opts)
      if filename
        Examples.new(filename, opts)
      else
        NullObject.new(:to_array => [])
      end
    end

    # Parses examples config file
    def initialize(filename, opts)
      @examples = JsonDuck.read(filename)
      @opts = opts
      prefix_urls
    end

    # Prefix all relative URL-s in examples list with path given in --examples-base-url
    def prefix_urls
      @examples.each do |group|
        group["items"].each do |ex|
          unless ex["url"] =~ /^https?:\/\//
            ex["url"] = @opts.examples_base_url + ex["url"]
          end
        end
      end
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
