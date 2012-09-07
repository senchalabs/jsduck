require 'rubygems'
require 'jsduck/aggregator'
require 'jsduck/source/file'
require 'jsduck/source/writer'
require 'jsduck/doc_formatter'
require 'jsduck/class_formatter'
require 'jsduck/class'
require 'jsduck/relations'
require 'jsduck/inherit_doc'
require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'jsduck/assets'
require 'jsduck/util/json'
require 'jsduck/util/io'
require 'jsduck/importer'
require 'jsduck/return_values'
require 'jsduck/lint'
require 'jsduck/template_dir'
require 'jsduck/class_writer'
require 'jsduck/app_data'
require 'jsduck/index_html'
require 'jsduck/exporter/api'
require 'jsduck/exporter/full'
require 'jsduck/exporter/app'
require 'jsduck/exporter/examples'
require 'jsduck/inline_examples'
require 'jsduck/guide_writer'
require 'jsduck/stdout'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
      # Sets the nr of parallel processes to use.
      # Set to 0 to disable parallelization completely.
      ParallelWrap.in_processes = @opts.processes
      # Turn JSON pretty-printing on/off
      Util::Json.pretty = @opts.pretty_json
    end

    # Call this after input parameters set
    def run
      parsed_files = parallel_parse(@opts.input_files)
      result = aggregate(parsed_files)
      @relations = filter_classes(result)
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
        Stdout.instance.flush
      else
        FileUtils.rm_rf(@opts.output_dir)
        TemplateDir.new(@opts).write

        IndexHtml.new(@assets, @opts).write

        AppData.new(@relations, @assets, @opts).write(@opts.output_dir+"/data.js")

        # class-formatting is done in parallel which breaks the links
        # between source files and classes. Therefore it MUST to be done
        # after writing sources which needs the links to work.
        if @opts.source
          source_writer = Source::Writer.new(parsed_files)
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

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      ParallelWrap.map(filenames) do |fname|
        Logger.instance.log("Parsing", fname)
        begin
          Source::File.new(Util::IO.read(fname), fname, @opts)
        rescue
          Logger.instance.fatal_backtrace("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
    end

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        Logger.instance.log("Aggregating", file.filename)
        agr.aggregate(file)
      end
      agr.classify_orphans
      agr.create_global_class
      agr.remove_ignored_classes
      agr.create_accessors
      if @opts.ext4_events == true || (@opts.ext4_events == nil && agr.ext4?)
        agr.append_ext4_event_options
      end
      agr.process_enums
      # Ignore override classes after applying them to actual classes
      @opts.external_classes += agr.process_overrides.map {|o| o[:name] }
      agr.result
    end

    # Turns all aggregated data into Class objects.
    # Depending on --ignore-global either keeps or discards the global class.
    # Warnings for global members are printed regardless of that setting,
    # but of course can be turned off using --warnings=-global
    def filter_classes(docs)
      classes = []
      docs.each do |d|
        cls = Class.new(d)
        if d[:name] != "global"
          classes << cls
        else
          # add global class only if --ignore-global not specified
          classes << cls unless @opts.ignore_global

          # Print warning for each global member
          cls.all_local_members.each do |m|
            type = m[:tagname].to_s
            name = m[:name]
            file = m[:files][0]
            Logger.instance.warn(:global, "Global #{type}: #{name}", file[:filename], file[:linenr])
          end
        end
      end
      Relations.new(classes, @opts.external_classes)
    end

    # Formats each class
    def format_classes
      doc_formatter = DocFormatter.new(@relations, @opts)
      doc_formatter.img_path = "images"
      class_formatter = ClassFormatter.new(@relations, doc_formatter)
      # Don't format types when exporting
      class_formatter.include_types = !@opts.export
      # Format all doc-objects in parallel
      formatted_classes = ParallelWrap.map(@relations.classes) do |cls|
        files = cls[:files].map {|f| f[:filename] }.join(" ")
        Logger.instance.log("Markdown formatting #{cls[:name]}", files)
        begin
          {
            :doc => class_formatter.format(cls.internal_doc),
            :images => doc_formatter.images
          }
        rescue
          Logger.instance.fatal_backtrace("Error while formatting #{cls[:name]} #{files}", $!)
          exit(1)
        end
      end
      # Then merge the data back to classes sequentially
      formatted_classes.each do |cls|
        @relations[cls[:doc][:name]].internal_doc = cls[:doc]
        cls[:images].each {|img| @assets.images.add(img) }
      end
    end

  end

end
