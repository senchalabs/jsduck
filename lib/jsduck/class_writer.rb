require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Writes class data into files
  class ClassWriter
    def initialize(exporter_class, relations, opts)
      @relations = relations
      @exporter = exporter_class.new(relations, opts)
      @parallel = ParallelWrap.new(:in_processes => opts.processes)
    end

    # Writes class data into given directory
    def write(dir)
      FileUtils.mkdir(dir)
      @parallel.each(@relations.classes) do |cls|
        filename = dir + "/" + cls[:name] + @exporter.extension
        Logger.instance.log("Writing docs", filename)
        @exporter.write(filename, cls)
      end
    end

  end

end
