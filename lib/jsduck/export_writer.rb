require 'jsduck/util/stdout'
require 'jsduck/exporter/full'
require 'jsduck/exporter/examples'
require 'jsduck/format/batch'
require 'jsduck/class_writer'
require 'jsduck/guide_writer'
require 'jsduck/output_dir'
require 'fileutils'

module JsDuck

  # Performs the export in one of the export formats.
  class ExportWriter
    def initialize(relations, assets, opts)
      @relations = relations
      @assets = assets
      @opts = opts
    end

    def write
      format_classes

      clean_output_dir unless @opts.output == :stdout

      export_classes
      export_examples_in_guides if @opts.export == :examples

      Util::Stdout.flush if @opts.output == :stdout
    end

    private

    def export_classes
      cw = ClassWriter.new(get_exporter, @relations, @opts)
      cw.write(@opts.output, ".json")
    end

    def get_exporter
      exporters = {
        :full => Exporter::Full,
        :examples => Exporter::Examples,
      }
      exporters[@opts.export]
    end

    def export_examples_in_guides
      gw = GuideWriter.new(Exporter::Examples, @assets.guides, @opts)
      gw.write(@opts.output, ".json")
    end

    # -- util routines --

    def clean_output_dir
      OutputDir.clean(@opts)
    end

    def format_classes
      Format::Batch.format_all!(@relations, @assets, @opts)
    end

  end

end
