require 'jsduck/json_duck'
require 'jsduck/null_object'
require 'jsduck/grouped_asset'

module JsDuck

  # Reads in videos JSON file
  class Videos < GroupedAsset
    # Parses videos config file
    def self.create(filename)
      if filename
        Videos.new(filename)
      else
        NullObject.new(:to_array => [], :[] => nil)
      end
    end

    def initialize(filename)
      @groups = JsonDuck.read(filename)
      add_names_if_missing
      build_map_by_name("Two videos have the same name", filename)
    end

    # Each video should have a name, which is used in URL to reference the video.
    # For backwards compatibility, when name is missing, we turn the "id" (that must exist)
    # into a name.
    def add_names_if_missing
      each_item do |video|
        video["name"] = video["id"] unless video["name"]
      end
    end

    # Extracts video icon URL from video hash
    def icon_url(video)
      video["thumb"]
    end

  end

end
