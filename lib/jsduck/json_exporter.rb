require 'jsduck/class_writer'
require 'fileutils'

module JsDuck

  # Performs JSON export of class data
  class JsonExporter
    def initialize(relations, opts)
      @relations = relations
      @opts = opts
    end

    def run(&format_classes)
      format_classes.call
      FileUtils.rm_rf(@opts.output_dir)
      FileUtils.mkdir(@opts.output_dir)
      cw = ClassWriter.new(@relations, @opts)
      cw.write(@opts.output_dir, ".json")
    end
  end

end
