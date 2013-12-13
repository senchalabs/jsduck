require 'jsduck/util/json'
require 'jsduck/util/null_object'
require 'jsduck/grouped_asset'

module JsDuck

  # Reads in videos JSON file
  class Videos < GroupedAsset
    # Parses videos config file
    def self.create(filename)
      if filename
        Videos.new(filename)
      else
        Util::NullObject.new(:to_array => [], :[] => nil)
      end
    end

    def initialize(filename)
      @groups = Util::Json.read(filename)
      add_names_if_missing
      build_map_by_name
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
