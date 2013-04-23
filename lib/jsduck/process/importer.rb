require 'jsduck/util/json'
require 'jsduck/util/null_object'
require 'jsduck/util/parallel'
require 'jsduck/logger'

module JsDuck
  module Process

    # Reads in JSDuck exports of different versions of docs.
    class Importer
      # Reads in data for all versions, returning array of
      # version/class-data pairs.  We don't use a hash to preserve the
      # order of versions (from oldest to newest).
      def import(versions)
        versions.map do |ver|
          {
            :version => ver[:version],
            :classes => ver[:path] ? read(ver) : current_version,
          }
        end
      end

      private

      def current_version
        Util::NullObject.new(:[] => Util::NullObject.new(:[] => true))
      end

      # Reads in data from all .json files in directory
      def read(ver)
        ensure_correct_format(ver[:path])

        # Map list of files into pairs of (classname, members-hash)
        pairs = Util::Parallel.map(Dir[ver[:path] + "/*.json"]) do |filename|
          Logger.log("Importing #{ver[:version]}", filename)
          json = Util::Json.read(filename)
          [json["name"],  members_id_index(json)]
        end

        # Turn key-value pairs array into hash
        return Hash[ pairs ]
      end

      def ensure_correct_format(path)
        # Read first JSON file in import dir
        json = Util::Json.read(Dir[path + "/*.json"].first)

        unless correct_format?(json)
          Logger.fatal("Bad format for importing: #{path}")
          Logger.fatal("Export format changed in 5.0.0 beta 2.")
          Logger.fatal("Maybe you forgot to re-generate the exports with new JSDuck.")
          exit(1)
        end
      end

      def correct_format?(json)
        json["members"].is_a?(Array)
      end

      # creates index of all class members
      def members_id_index(json)
        index = {}
        json["members"].each do |m|
          index[m["id"]] = true
        end
        index
      end

    end

  end
end
