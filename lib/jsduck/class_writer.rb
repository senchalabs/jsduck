require 'jsduck/parallel_wrap'
require 'jsduck/exporter'
require 'jsduck/renderer'
require 'jsduck/doc_formatter'
require 'jsduck/logger'
require 'jsduck/json_duck'
require 'fileutils'

module JsDuck

  # Writes class JSON into files
  class ClassWriter
    def initialize(relations, opts)
      @relations = relations
      @opts = opts
      @parallel = ParallelWrap.new(:in_processes => @opts.processes)
    end

    # Writes JSON export or JsonP file for each class
    def write(dir, extension=".json")
      exporter = Exporter.new(@relations)
      renderer = Renderer.new
      # Inject formatter to all meta-tags.
      doc_formatter = DocFormatter.new(@relations, @opts)
      @opts.meta_tags.each {|tag| tag.formatter = doc_formatter }
      renderer.meta_tags = @opts.meta_tags

      FileUtils.mkdir(dir)
      @parallel.each(@relations.classes) do |cls|
        filename = dir + "/" + cls[:name] + extension
        Logger.instance.log("Writing docs", filename)
        data = exporter.export(cls)
        if extension == ".json"
          JsonDuck.write_json(filename, data)
        else
          data[:html] = renderer.render(data)
          data = exporter.compact(data)
          JsonDuck.write_jsonp(filename, cls[:name].gsub(/\./, "_"), data)
        end
      end
    end

  end

end
