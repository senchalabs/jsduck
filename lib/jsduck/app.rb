require 'rubygems'
require 'jsduck/aggregator'
require 'jsduck/source_file'
require 'jsduck/doc_formatter'
require 'jsduck/class_formatter'
require 'jsduck/class'
require 'jsduck/relations'
require 'jsduck/inherit_doc'
require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'jsduck/welcome'
require 'jsduck/guides'
require 'jsduck/videos'
require 'jsduck/examples'
require 'jsduck/categories'
require 'jsduck/images'
require 'jsduck/json_duck'
require 'jsduck/lint'
require 'jsduck/template_dir'
require 'jsduck/class_writer'
require 'jsduck/source_writer'
require 'jsduck/app_data'
require 'jsduck/index_html'
require 'jsduck/api_exporter'
require 'jsduck/full_exporter'
require 'jsduck/app_exporter'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
      # Sets the nr of parallel processes to use.
      # Set to 0 to disable parallelization completely.
      @parallel = ParallelWrap.new(:in_processes => @opts.processes)
      # Turn JSON pretty-printing on/off
      JsonDuck.pretty = @opts.pretty_json
    end

    # Call this after input parameters set
    def run
      parsed_files = parallel_parse(@opts.input_files)
      result = aggregate(parsed_files)
      @relations = filter_classes(result)
      InheritDoc.new(@relations).resolve_all
      Lint.new(@relations).run

      @images = Images.new(@opts.images)
      @welcome = Welcome.create(@opts.welcome)
      @guides = Guides.create(@opts.guides, DocFormatter.new(@relations, @opts))
      @videos = Videos.create(@opts.videos)
      @examples = Examples.create(@opts.examples, @opts)
      @categories = Categories.create(@opts.categories_path, DocFormatter.new(@relations, @opts), @relations)

      if @opts.export
        format_classes
        FileUtils.rm_rf(@opts.output_dir) unless @opts.output_dir == :stdout
        exporters = {:full => FullExporter, :api => ApiExporter}
        cw = ClassWriter.new(exporters[@opts.export], @relations, @opts)
        cw.write(@opts.output_dir, ".json")
      else
        FileUtils.rm_rf(@opts.output_dir)
        TemplateDir.new(@opts).write

        index = IndexHtml.new(@opts)
        index.welcome = @welcome
        index.categories = @categories
        index.guides = @guides
        index.write

        app_data = AppData.new(@relations, @opts)
        app_data.guides = @guides
        app_data.videos = @videos
        app_data.examples = @examples
        app_data.write(@opts.output_dir+"/data.js")

        # class-formatting is done in parallel which breaks the links
        # between source files and classes. Therefore it MUST to be done
        # after writing sources which needs the links to work.
        source_writer = SourceWriter.new(parsed_files, @parallel)
        source_writer.write(@opts.output_dir + "/source")
        format_classes

        cw = ClassWriter.new(AppExporter, @relations, @opts)
        cw.write(@opts.output_dir+"/output", ".js")

        @guides.write(@opts.output_dir+"/guides")
        @videos.write(@opts.output_dir+"/videos")
        @examples.write(@opts.output_dir+"/examples")
        @images.copy(@opts.output_dir+"/images")
      end
    end

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      @parallel.map(filenames) do |fname|
        Logger.instance.log("Parsing", fname)
        SourceFile.new(IO.read(fname), fname, @opts)
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
      agr.create_accessors
      agr.append_ext4_event_options
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
      formatted_classes = @parallel.map(@relations.classes) do |cls|
        Logger.instance.log("Markdown formatting #{cls[:name]}")
        {
          :doc => class_formatter.format(cls.internal_doc),
          :images => doc_formatter.images
        }
      end
      # Then merge the data back to classes sequentially
      formatted_classes.each do |cls|
        @relations[cls[:doc][:name]].internal_doc = cls[:doc]
        cls[:images].each {|img| @images.add(img) }
      end
    end

  end

end
