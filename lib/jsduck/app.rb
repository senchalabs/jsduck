require 'rubygems'
require 'jsduck/util/parallel'
require 'jsduck/util/json'
require 'jsduck/util/stdout'
require 'jsduck/source/writer'
require 'jsduck/exporter/api'
require 'jsduck/exporter/full'
require 'jsduck/exporter/app'
require 'jsduck/exporter/examples'
require 'jsduck/batch_parser'
require 'jsduck/batch_formatter'
require 'jsduck/inherit_doc'
require 'jsduck/logger'
require 'jsduck/assets'
require 'jsduck/importer'
require 'jsduck/return_values'
require 'jsduck/lint'
require 'jsduck/template_dir'
require 'jsduck/class_writer'
require 'jsduck/app_data'
require 'jsduck/index_html'
require 'jsduck/inline_examples'
require 'jsduck/guide_writer'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
      # Sets the nr of parallel processes to use.
      # Set to 0 to disable parallelization completely.
      Util::Parallel.in_processes = @opts.processes
      # Turn JSON pretty-printing on/off
      Util::Json.pretty = @opts.pretty_json
    end

    # Call this after input parameters set
    def run
      batch_parser = BatchParser.new(@opts)
      @relations = batch_parser.run

      InheritDoc.new(@relations).resolve_all
      Importer.import(@opts.imports, @relations, @opts.new_since)
      ReturnValues.auto_detect(@relations)
      Lint.new(@relations).run

      # Initialize guides, videos, examples, ...
      @assets = Assets.new(@relations, @opts)

      # Give access to assets from all meta-tags
      MetaTagRegistry.instance.assets = @assets

      if @opts.export
        format_classes
        FileUtils.rm_rf(@opts.output_dir) unless @opts.output_dir == :stdout
        exporters = {
          :full => Exporter::Full,
          :api => Exporter::Api,
          :examples => ExamplesExporter::Examples,
        }
        cw = ClassWriter.new(exporters[@opts.export], @relations, @opts)
        cw.write(@opts.output_dir, ".json")
        if @opts.export == :examples
          gw = GuideWriter.new(exporters[@opts.export], @assets.guides, @opts)
          gw.write(@opts.output_dir, ".json")
        end
        Util::Stdout.flush
      else
        FileUtils.rm_rf(@opts.output_dir)
        TemplateDir.new(@opts).write

        IndexHtml.new(@assets, @opts).write

        AppData.new(@relations, @assets, @opts).write(@opts.output_dir+"/data.js")

        # class-formatting is done in parallel which breaks the links
        # between source files and classes. Therefore it MUST to be done
        # after writing sources which needs the links to work.
        if @opts.source
          source_writer = Source::Writer.new(batch_parser.parsed_files)
          source_writer.write(@opts.output_dir + "/source")
        end
        format_classes

        if @opts.tests
          examples = InlineExamples.new
          examples.add_classes(@relations)
          examples.add_guides(@assets.guides)
          examples.write(@opts.output_dir+"/inline-examples.js")
        end

        cw = ClassWriter.new(Exporter::App, @relations, @opts)
        cw.write(@opts.output_dir+"/output", ".js")

        @assets.write
      end
    end

    # Formats each class
    def format_classes
      BatchFormatter.format_all!(@relations, @assets, @opts)
    end

  end

end
