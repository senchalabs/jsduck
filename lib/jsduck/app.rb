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
require 'jsduck/categories'
require 'jsduck/jsonp'
require 'jsduck/lint'
require 'json'
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
    end

    # Call this after input parameters set
    def run
      parsed_files = @timer.time(:parsing) { parallel_parse(@opts.input_files) }
      result = @timer.time(:aggregating) { aggregate(parsed_files) }
      relations = @timer.time(:aggregating) { filter_classes(result) }
      Aliases.new(relations).resolve_all
      Lint.new(relations).run

      @guides = Guides.new(get_doc_formatter(relations), @opts.guides_order)
      if @opts.guides_dir
        @timer.time(:parsing) { @guides.parse_dir(@opts.guides_dir) }
      end

      @categories = Categories.new(get_doc_formatter(relations), relations)
      if @opts.categories_path
        @timer.time(:parsing) do
          @categories.parse(@opts.categories_path)
          @categories.validate
        end
      end

      clear_dir(@opts.output_dir) unless @opts.export == :stdout
      if @opts.export == :stdout
        @timer.time(:generating) { puts JSON.generate(relations.classes) }
      elsif @opts.export == :json
        FileUtils.mkdir(@opts.output_dir)
        init_output_dirs(@opts.output_dir)
        @timer.time(:generating) { write_src(@opts.output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_classes(@opts.output_dir+"/output", relations) }
      else
        if @opts.template_links
          link_template(@opts.template_dir, @opts.output_dir)
        else
          copy_template(@opts.template_dir, @opts.output_dir)
        end
        create_index_html(@opts.template_dir, @opts.output_dir)
        @timer.time(:generating) { write_src(@opts.output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_tree(@opts.output_dir+"/output/tree.js", relations) }
        @timer.time(:generating) { write_search_data(@opts.output_dir+"/output/searchData.js", relations) }
        @timer.time(:generating) { write_classes(@opts.output_dir+"/output", relations) }
        @timer.time(:generating) { @guides.write(@opts.output_dir+"/guides") }
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

    # Given all classes, generates namespace tree and writes it
    # in JSON form into a file.
    def write_tree(filename, relations)
      tree = Tree.new.create(relations.classes, @guides)
      icons = TreeIcons.new.extract_icons(tree)
      js = "Docs.classData = " + JSON.generate( tree ) + ";"
      js += "Docs.icons = " + JSON.generate( icons ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
    end

    # Given all classes, generates members data for search and writes in
    # in JSON form into a file.
    def write_search_data(filename, relations)
      search_data = SearchData.new.create(relations.classes)
      js = "Docs.searchData = " + JSON.generate( {:data => search_data} ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
    end

    # Writes JsonP export file for each class
    def write_classes(path, relations)
      exporter = Exporter.new(relations, get_doc_formatter(relations))
      @parallel.each(relations.classes) do |cls|
        filename = path + "/" + cls[:name] + ".js"
        Logger.instance.log("Writing to #{filename} ...")
        JsonP.write(filename, cls[:name].gsub(/\./, "_"), exporter.export(cls))
      end
    end

    # Writes formatted HTML source code for each input file
    def write_src(path, parsed_files)
      src = SourceWriter.new(path, @opts.export ? nil : :page)
      # Can't be done in parallel, because file.html_filename= method
      # updates all the doc-objects related to the file
      parsed_files.each do |file|
        html_filename = src.write(file.to_html, file.filename)
        Logger.instance.log("Writing to #{html_filename} ...")
        file.html_filename = File.basename(html_filename)
      end
    end

    # Creates and initializes DocFormatter
    def get_doc_formatter(relations)
      formatter = DocFormatter.new
      formatter.link_tpl = @opts.link_tpl if @opts.link_tpl
      formatter.img_tpl = @opts.img_tpl if @opts.img_tpl
      formatter.relations = relations
      formatter.get_example = lambda {|path| IO.read(@opts.examples_dir + "/" + path) } if @opts.examples_dir
      formatter
    end

    def copy_template(template_dir, dir)
      Logger.instance.log("Copying template files to #{dir}...")
      FileUtils.cp_r(template_dir, dir)
      init_output_dirs(dir)
    end

    def link_template(template_dir, dir)
      Logger.instance.log("Linking template files to #{dir}...")
      FileUtils.mkdir(dir)
      Dir.glob(template_dir + "/*").each do |file|
        File.symlink(File.expand_path(file), dir+"/"+File.basename(file))
      end
      init_output_dirs(dir)
    end

    def clear_dir(dir)
      if File.exists?(dir)
        FileUtils.rm_r(dir)
      end
    end

    def init_output_dirs(dir)
      FileUtils.mkdir(dir + "/output")
      FileUtils.mkdir(dir + "/source")
    end

    def create_index_html(template_dir, dir)
      Logger.instance.log("Creating #{dir}/index.html...")
      html = IO.read(template_dir+"/index.html")
      html.gsub!("{title}", @opts.title)
      html.gsub!("{footer}", "<div id='footer-content' style='display: none'>#{@footer}</div>")
      html.gsub!("{extjs_path}", @opts.extjs_path)
      html.gsub!("{local_storage_db}", @opts.local_storage_db)
      html.gsub!("{guides}", @guides.to_html)
      html.gsub!("{categories}", @categories.to_html)
      html.gsub!("{head_html}", @opts.head_html)
      html.gsub!("{body_html}", @opts.body_html)
      FileUtils.rm(dir+"/index.html")
      File.open(dir+"/index.html", 'w') {|f| f.write(html) }
    end
  end

end
