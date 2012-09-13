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
      @batch_parser = BatchParser.new(@opts)
      @relations = @batch_parser.run

      apply_extra_processing

      init_assets

      if @opts.export
        generate_export
      else
        generate_web_page
      end
    end

    private

    def apply_extra_processing
      InheritDoc.new(@relations).resolve_all
      Importer.import(@opts.imports, @relations, @opts.new_since)
      ReturnValues.auto_detect(@relations)
      Lint.new(@relations).run
    end

    def init_assets
      # Initialize guides, videos, examples, ...
      @assets = Assets.new(@relations, @opts)

      # Give access to assets from all meta-tags
      MetaTagRegistry.instance.assets = @assets
    end


    # -- export --


    def generate_export
      format_classes

      clean_output_dir unless @opts.output_dir == :stdout

      export_classes
      export_examples_in_guides if @opts.export == :examples

      Util::Stdout.flush if @opts.output_dir == :stdout
    end

    def export_classes
      cw = ClassWriter.new(get_exporter, @relations, @opts)
      cw.write(@opts.output_dir, ".json")
    end

    def get_exporter
      exporters = {
        :full => Exporter::Full,
        :api => Exporter::Api,
        :examples => Exporter::Examples,
      }
      exporters[@opts.export]
    end

    def export_examples_in_guides
      gw = GuideWriter.new(Exporter::Examples, @assets.guides, @opts)
      gw.write(@opts.output_dir, ".json")
    end


    # -- web page --


    def generate_web_page
      clean_output_dir

      write_template_files
      write_app_data

      # class-formatting is done in parallel which breaks the links
      # between source files and classes. Therefore it MUST to be done
      # after writing sources which needs the links to work.
      write_source if @opts.source
      format_classes

      write_inline_examples if @opts.tests

      write_classes

      @assets.write
    end

    def write_template_files
      TemplateDir.new(@opts).write
      IndexHtml.new(@assets, @opts).write
    end

    def write_app_data
      AppData.new(@relations, @assets, @opts).write(@opts.output_dir+"/data.js")
    end

    def write_source
      source_writer = Source::Writer.new(@batch_parser.parsed_files)
      source_writer.write(@opts.output_dir + "/source")
    end

    def write_inline_examples
      examples = InlineExamples.new
      examples.add_classes(@relations)
      examples.add_guides(@assets.guides)
      examples.write(@opts.output_dir+"/inline-examples.js")
    end

    def write_classes
      class_writer = ClassWriter.new(Exporter::App, @relations, @opts)
      class_writer.write(@opts.output_dir+"/output", ".js")
    end

    # -- util routines --

    def clean_output_dir
      FileUtils.rm_rf(@opts.output_dir)
    end

    def format_classes
      BatchFormatter.format_all!(@relations, @assets, @opts)
    end

  end

end
