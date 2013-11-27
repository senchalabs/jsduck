require 'jsduck/util/json'

module JsDuck
  module Options

    # Handles reading of JSB3 files.
    class Jsb

      # Extracts files of first build in JSB3 file.
      def self.read(filename)
        json = Util::Json.read(filename)
        basedir = File.dirname(filename)

        return json["builds"][0]["packages"].map do |package_id|
          package = json["packages"].find {|p| p["id"] == package_id }
          (package ? package["files"] : []).map do |file|
            File.expand_path(basedir + "/" + file["path"] + file["name"])
          end
        end.flatten
      end

    end

  end
end
