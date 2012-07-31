require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'jsduck/stdout'
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
      Stdout.instance.add(json)
    end

    def write_dir(dir, extension)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      ParallelWrap.each(all_guides) do |guide|
        filename = dir + "/" + guide["name"] + extension
        Logger.instance.log("Writing guide", filename)
        json = @exporter.export_guide(guide)
        # skip file if exporter returned nil
        if json
          if extension == ".json"
            JsonDuck.write_json(filename, json)
          elsif extension == ".js"
            JsonDuck.write_jsonp(filename, guide["name"], json)
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
