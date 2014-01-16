require 'jsduck/util/parallel'
require 'jsduck/util/stdout'
require 'jsduck/util/json'
require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Writes guide data into files in JSON or JSONP format or to STDOUT.
  class GuideWriter
    def initialize(exporter_class, guides, opts)
      @guides = guides
      @exporter = exporter_class.new(guides, opts)
    end

    # Writes guide data into given directory or STDOUT when dir == :stdout.
    #
    # Extension is either ".json" for normal JSON output
    # or ".js" for JsonP output.
    def write(dir, extension)
      dir == :stdout ? write_stdout : write_dir(dir, extension)
    end

    private

    def write_stdout
      json = ParallelWrap.map(all_guides) {|guide| @exporter.export_guide(guide) }.compact
      Util::Stdout.add(json)
    end

    def write_dir(dir, extension)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      Util::Parallel.each(all_guides) do |guide|
        filename = dir + "/" + guide["name"] + extension
        Logger.log("Writing guide", filename)
        json = @exporter.export_guide(guide)
        # skip file if exporter returned nil
        if json
          if extension == ".json"
            Util::Json.write_json(filename, json)
          elsif extension == ".js"
            Util::Json.write_jsonp(filename, guide["name"], json)
          else
            throw "Unexpected file extension: #{extension}"
          end
        end
      end
    end

    def all_guides
      arr = []
      @guides.each_item {|g| arr << g }
      arr
    end

  end

end
