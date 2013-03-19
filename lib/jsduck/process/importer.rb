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
        # Map list of files into pairs of (classname, members-hash)
        pairs = Util::Parallel.map(Dir[ver[:path] + "/*.json"]) do |filename|
          JsDuck::Logger.log("Importing #{ver[:version]}", filename)
          json = Util::Json.read(filename)
          [json["name"],  members_id_index(json)]
        end

        # Turn key-value pairs array into hash
        return Hash[ pairs ]
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
