require 'jsduck/json_duck'

module JsDuck

  # Reads in videos JSON file
  class Videos
    def initialize
      @videos = []
    end

    # Parses videos config file
    def parse(filename)
      @videos = JsonDuck.read(filename)
    end

    # Writes videos JSON file to a dir
    def write(dir)
      return if @videos.length == 0

      FileUtils.mkdir(dir) unless File.exists?(dir)
      # Write the JSON to output dir, so it's available in released
      # version of docs and people can use it with JSDuck by themselves.
      JsonDuck.write_json(dir+"/videos.json", @videos)
    end

    # Returns all videos as array
    def to_array
      @videos
    end

  end

end
