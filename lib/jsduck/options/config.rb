require 'jsduck/util/json'

module JsDuck
  module Options

    # Handles reading JSON config file, specified by --config option.
    class Config

      # Reads JSON configuration from file and returns an array of
      # config options that can be feeded into optparser.
      def self.read(filename)
        config = []
        json = Util::Json.read(filename)
        json.each_pair do |key, value|
          if key == "--"
            # filenames
            config += Array(value).map(&:to_s)
          elsif value == true
            # simple switch
            config += [key.to_s]
          else
            # An option with value or with multiple values.
            # In the latter case, add the option multiple times.
            Array(value).each do |v|
              config += [key.to_s, v.to_s]
            end
          end
        end
        config
      end

    end

  end
end
