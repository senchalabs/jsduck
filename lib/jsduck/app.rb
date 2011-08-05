require 'rubygems'
require 'jsduck/aggregator'
require 'jsduck/source_file'
require 'jsduck/source_writer'
require 'jsduck/doc_formatter'
require 'jsduck/class'
require 'jsduck/tree'
require 'jsduck/tree_icons'
require 'jsduck/search_data'
require 'jsduck/relations'
require 'jsduck/aliases'
require 'jsduck/exporter'
require 'jsduck/timer'
require 'jsduck/parallel_wrap'
require 'jsduck/logger'
require 'jsduck/guides'
require 'jsduck/videos'
require 'jsduck/categories'
require 'jsduck/json_duck'
require 'jsduck/lint'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
      @timer = Timer.new
      # Sets the nr of parallel processes to use.
      # Set to 0 to disable parallelization completely.
      @parallel = ParallelWrap.new(:in_processes => @opts.processes)
      # Sets warnings and verbose mode on or off
      Logger.instance.warnings = @opts.warnings
      Logger.instance.verbose = @opts.verbose
      # Turn JSON pretty-printing on/off
      JsonDuck.pretty = @opts.pretty_json
    end

    # Call this after input parameters set
    def run
      parsed_files = @timer.time(:parsing) { parallel_parse(@opts.input_files) }
      result = @timer.time(:aggregating) { aggregate(parsed_files) }
      @relations = @timer.time(:aggregating) { filter_classes(result) }
      Aliases.new(@relations).resolve_all
      Lint.new(@relations).run

      @guides = Guides.new(get_doc_formatter)
      if @opts.guides
        @timer.time(:parsing) { @guides.parse(@opts.guides) }
      end

      @videos = Videos.new
      if @opts.videos
        @timer.time(:parsing) { @videos.parse(@opts.videos) }
      end

      @categories = Categories.new(get_doc_formatter, @relations)
      if @opts.categories_path
        @timer.time(:parsing) do
          @categories.parse(@opts.categories_path)
          @categories.validate
        end
      end

      clear_output_dir unless @opts.export == :stdout
      if @opts.export == :stdout
        @timer.time(:generating) { puts JsonDuck.generate(@relations.classes) }
      elsif @opts.export == :json
        FileUtils.mkdir(@opts.output_dir)
        init_output_dirs
        @timer.time(:generating) { write_src(parsed_files) }
        @timer.time(:generating) { write_classes }
      else
        if @opts.template_links
          link_template
        else
          copy_template
        end
        create_index_html
        @timer.time(:generating) { write_src(parsed_files) }
        @timer.time(:generating) { write_app_data }
        @timer.time(:generating) { write_classes }
        @timer.time(:generating) { @guides.write(@opts.output_dir+"/guides") }
        @timer.time(:generating) { @videos.write(@opts.output_dir+"/videos") }
      end

      @timer.report
    end

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      @parallel.map(filenames) do |fname|
        Logger.instance.log("Parsing #{fname} ...")
        SourceFile.new(IO.read(fname), fname)
      end
    end

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        Logger.instance.log("Aggregating #{file.filename} ...")
        agr.aggregate(file)
      end
      agr.classify_orphans
      agr.create_global_class unless @opts.ignore_global
      agr.append_ext4_event_options
      agr.result
    end

    # Filters out class-documentations, converting them to Class objects.
    # For each other type, prints a warning message and discards it
    def filter_classes(docs)
      classes = []
      docs.each do |d|
        if d[:tagname] == :class
          classes << Class.new(d) if !d[:private] || @opts.show_private_classes
        else
          type = d[:tagname].to_s
          name = d[:name]
          file = d[:filename]
          line = d[:linenr]
          Logger.instance.warn("Ignoring #{type}: #{name} in #{file} line #{line}")
        end
      end
      Relations.new(classes, @opts.external_classes)
    end

    # Writes classes, guides, videos, and search data to one big .js file
    def write_app_data
      tree = Tree.new.create(@relations.classes)
      icons = TreeIcons.new.extract_icons(tree)
      js = "Docs.data = " + JsonDuck.generate({
        :classes => tree,
        :icons => icons,
        :guides => @guides.to_array,
        :videos => @videos.to_array,
        :search => SearchData.new.create(@relations.classes),
      }) + ";\n"
      File.open(@opts.output_dir+"/data.js", 'w') {|f| f.write(js) }
    end

    # Writes JSON export or JsonP file for each class
    def write_classes
      exporter = Exporter.new(@relations, get_doc_formatter)
      @parallel.each(@relations.classes) do |cls|
        filename = @opts.output_dir+"/output/" + cls[:name] + (@opts.export ? ".json" : ".js")
        Logger.instance.log("Writing to #{filename} ...")
        data = exporter.export(cls)
        if @opts.export
          JsonDuck.write_json(filename, data)
        else
          JsonDuck.write_jsonp(filename, cls[:name].gsub(/\./, "_"), data)
        end
      end
    end

    # Writes formatted HTML source code for each input file
    def write_src(parsed_files)
      src = SourceWriter.new(@opts.output_dir + "/source", @opts.export ? nil : :page)
      # Can't be done in parallel, because file.html_filename= method
      # updates all the doc-objects related to the file
      parsed_files.each do |file|
        html_filename = src.write(file.to_html, file.filename)
        Logger.instance.log("Writing to #{html_filename} ...")
        file.html_filename = File.basename(html_filename)
      end
    end

    # Creates and initializes DocFormatter
    def get_doc_formatter
      formatter = DocFormatter.new
      formatter.link_tpl = @opts.link_tpl if @opts.link_tpl
      formatter.img_tpl = @opts.img_tpl if @opts.img_tpl
      formatter.relations = @relations
      if @opts.inline_examples_dir
        formatter.get_example = lambda {|path| IO.read(@opts.inline_examples_dir + "/" + path) }
      end
      formatter
    end

    def copy_template
      Logger.instance.log("Copying template files to #{@opts.output_dir}...")
      FileUtils.cp_r(@opts.template_dir, @opts.output_dir)
      init_output_dirs
    end

    def link_template
      Logger.instance.log("Linking template files to #{@opts.output_dir}...")
      FileUtils.mkdir(@opts.output_dir)
      Dir.glob(@opts.template_dir + "/*").each do |file|
        File.symlink(File.expand_path(file), @opts.output_dir+"/"+File.basename(file))
      end
      init_output_dirs
    end

    def clear_output_dir
      if File.exists?(@opts.output_dir)
        FileUtils.rm_r(@opts.output_dir)
      end
    end

    def init_output_dirs
      FileUtils.mkdir(@opts.output_dir + "/output")
      FileUtils.mkdir(@opts.output_dir + "/source")
    end

    def create_index_html
      Logger.instance.log("Creating #{@opts.output_dir}/index.html...")
      html = IO.read(@opts.template_dir+"/index.html")
      html.gsub!("{title}", @opts.title)
      html.gsub!("{footer}", "<div id='footer-content' style='display: none'>#{@footer}</div>")
      html.gsub!("{extjs_path}", @opts.extjs_path)
      html.gsub!("{local_storage_db}", @opts.local_storage_db)
      html.gsub!("{categories}", @categories.to_html)
      html.gsub!("{head_html}", @opts.head_html)
      html.gsub!("{body_html}", @opts.body_html)
      FileUtils.rm(@opts.output_dir+"/index.html")
      File.open(@opts.output_dir+"/index.html", 'w') {|f| f.write(html) }
    end
  end

end
