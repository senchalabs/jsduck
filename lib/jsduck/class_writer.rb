require 'jsduck/util/parallel'
require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/stdout'
require 'fileutils'

module JsDuck

  # Writes class data into files in JSON or JSONP format or to STDOUT.
  class ClassWriter
    def initialize(exporter_class, relations, opts)
      @relations = relations
      @exporter = exporter_class.new(relations, opts)
    end

    # Writes class data into given directory or STDOUT when dir == :stdout.
    #
    # Extension is either ".json" for normal JSON output
    # or ".js" for JsonP output.
    def write(dir, extension)
      dir == :stdout ? write_stdout : write_dir(dir, extension)
    end

    private

    def write_stdout
      json = Util::Parallel.map(@relations.classes) {|cls| @exporter.export(cls) }.compact
      Util::Stdout.add(json)
    end

    def write_dir(dir, extension)
      FileUtils.mkdir(dir)
      Util::Parallel.each(@relations.classes) do |cls|
        filename = dir + "/" + cls[:name] + extension
        Logger.log("Writing docs", filename)
        json = @exporter.export(cls)
        # skip file if exporter returned nil
        if json
          if extension == ".json"
            Util::Json.write_json(filename, json)
          elsif extension == ".js"
            Util::Json.write_jsonp(filename, cls[:name].gsub(/\./, "_"), json)
          else
            throw "Unexpected file extension: #{extension}"
          end
        end
      end
    end

  end

end
