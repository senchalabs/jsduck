require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'jsduck/json_duck'
require 'fileutils'

module JsDuck

  # Writes guide data into files in JSON or JSONP format or to STDOUT.
  class GuideWriter
    def initialize(exporter_class, guides, opts)
      @guides = guides
      @exporter = exporter_class.new(guides, opts)
      @parallel = ParallelWrap.new(:in_processes => opts.processes)
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
      json = @parallel.map(all_guides) {|g| @exporter.export_guide(g[0], g[1]) }.compact
      puts JsonDuck.generate(json)
    end

    def write_dir(dir, extension)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      @parallel.each(all_guides) do |g|
        name = g[0]["name"]
        filename = dir + "/" + name + extension
        Logger.instance.log("Writing guide", filename)
        json = @exporter.export_guide(g[0], g[1])
        # skip file if exporter returned nil
        if json
          if extension == ".json"
            JsonDuck.write_json(filename, json)
          elsif extension == ".js"
            JsonDuck.write_jsonp(filename, name, json)
          else
            throw "Unexpected file extension: #{extension}"
          end
        end
      end
    end

    def all_guides
      guides = []
      @guides.each_guide_with_html do |guide, html|
        guides << [guide, html]
      end
      guides
    end

  end

end
