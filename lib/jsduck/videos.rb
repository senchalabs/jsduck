require 'jsduck/json_duck'
require 'jsduck/null_object'
require 'jsduck/logger'

module JsDuck

  # Reads in videos JSON file
  class Videos
    # Parses videos config file
    def self.create(filename)
      if filename
        Videos.new(filename)
      else
        NullObject.new(:to_array => [])
      end
    end

    def initialize(filename)
      @videos = JsonDuck.read(filename)
      add_names_if_missing
    end

    # Each video should have a name, which is used in URL to reference the video.
    # For backwards compatibility, when name is missing, we turn the "id" (that must exist)
    # into a name.  Additionally check that no two videos have the same name.
    def add_names_if_missing
      uniq_names = {}
      @videos.each do |group|
        group["items"].each do |video|
          video["name"] = video["id"] unless video["name"]

          if uniq_names[video["name"]]
            Logger.instance.warn(nil, "Two videos have the same name '#{video['name']}'")
          end
          uniq_names[video["name"]] = true
        end
      end
    end

    # Writes videos JSON file to a dir
    def write(dir)
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
