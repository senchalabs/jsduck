require 'json'

module JsDuck

  # Reads in videos JSON file
  class Videos
    def initialize
      @videos = []
    end

    # Parses videos config file
    def parse(filename)
      @videos = JSON.parse(IO.read(filename))
    end

    # Returns all videos as array
    def to_array
      @videos
    end

  end

end
