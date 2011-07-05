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
require 'json'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # These are basically input parameters for app
    attr_accessor :output_to_stdout
    attr_accessor :output_dir
    attr_accessor :template_dir
    attr_accessor :guides_dir
    attr_accessor :guides_order
    attr_accessor :categories_path
    attr_accessor :template_links
    attr_accessor :input_files
    attr_accessor :export
    attr_accessor :link_tpl
    attr_accessor :img_tpl
    attr_accessor :ignore_global
    attr_accessor :external_classes
    attr_accessor :show_private_classes
    attr_accessor :title
    attr_accessor :footer
    attr_accessor :extjs_path
    attr_accessor :append_html

    def initialize
      @output_to_stdout = false
      @output_dir = nil
      @template_dir = nil
      @guides_dir = nil
      @guides_order = nil
      @categories_path = nil
      @template_links = false
      @input_files = []
      @warnings = true
      @export = nil
      @link_tpl = nil
      @img_tpl = nil
      @ignore_global = false
      @external_classes = []
      @show_private_classes = false
      @title = "Ext JS API Documentation"
      @footer = 'Generated with <a href="https://github.com/senchalabs/jsduck">JSDuck</a>.'
      @extjs_path = "extjs/ext-all.js"
      @append_html = ""
      @timer = Timer.new
      @parallel = ParallelWrap.new
    end

    # Sets the nr of parallel processes to use.
    # Set to 0 to disable parallelization completely.
    def processes=(count)
      @parallel = ParallelWrap.new(:in_processes => count)
    end

    # Sets warnings on or off
    def warnings=(enabled)
      Logger.instance.warnings = enabled
    end

    # Sets verbose mode on or off
    def verbose=(enabled)
      Logger.instance.verbose = enabled
    end

    # Call this after input parameters set
    def run
      # Set default templates
      @link_tpl ||= '<a href="#/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'
      # Note that we wrap image template inside <p> because {@img} often
      # appears inline within text, but that just looks ugly in HTML
      @img_tpl ||= '<p><img src="doc-resources/%u" alt="%a"></p>'

      parsed_files = @timer.time(:parsing) { parallel_parse(@input_files) }
      result = @timer.time(:aggregating) { aggregate(parsed_files) }
      relations = @timer.time(:aggregating) { filter_classes(result) }
      Aliases.new(relations).resolve_all
      warn_globals(relations)
      warn_unnamed(relations)

      @guides = Guides.new(get_doc_formatter(relations), @guides_order)
      if @guides_dir
        @timer.time(:parsing) { @guides.parse_dir(@guides_dir) }
      end

      @categories = Categories.new(get_doc_formatter(relations), relations)
      if @categories_path
        @timer.time(:parsing) do
          @categories.parse(@categories_path)
          @categories.validate
        end
      end

      clear_dir(@output_dir) unless @output_to_stdout
      if @output_to_stdout
        @timer.time(:generating) { output_classes(relations) }
      elsif @export == :json
        FileUtils.mkdir(@output_dir)
        init_output_dirs(@output_dir)
        @timer.time(:generating) { write_src(@output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_classes(@output_dir+"/output", relations) }
      else
        if @template_links
          link_template(@template_dir, @output_dir)
        else
          copy_template(@template_dir, @output_dir)
        end
        create_index_html(@template_dir, @output_dir)
        @timer.time(:generating) { write_src(@output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_tree(@output_dir+"/output/tree.js", relations) }
        @timer.time(:generating) { write_search_data(@output_dir+"/output/searchData.js", relations) }
        @timer.time(:generating) { write_classes(@output_dir+"/output", relations) }
        @timer.time(:generating) { @guides.write(@output_dir+"/guides") }
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
      agr.create_global_class unless @ignore_global
      agr.append_ext4_event_options
      agr.result
    end

    # Filters out class-documentations, converting them to Class objects.
    # For each other type, prints a warning message and discards it
    def filter_classes(docs)
      classes = []
      docs.each do |d|
        if d[:tagname] == :class
          classes << Class.new(d) if !d[:private] || @show_private_classes
        else
          type = d[:tagname].to_s
          name = d[:name]
          file = d[:filename]
          line = d[:linenr]
          Logger.instance.warn("Ignoring #{type}: #{name} in #{file} line #{line}")
        end
      end
      Relations.new(classes, @external_classes)
    end

    # print warning for each global member
    def warn_globals(relations)
      global = relations["global"]
      return unless global
      global[:members].each_key do |type|
        global.members(type).each do |member|
          name = member[:name]
          file = member[:filename]
          line = member[:linenr]
          Logger.instance.warn("Global #{type}: #{name} in #{file} line #{line}")
        end
      end
    end

    # print warning for each member with no name
    def warn_unnamed(relations)
      relations.each do |cls|
        cls[:members].each_pair do |type, members|
          members.each do |member|
            if !member[:name] || member[:name] == ""
              file = member[:filename]
              line = member[:linenr]
              Logger.instance.warn("Unnamed #{type} in #{file} line #{line}")
            end
          end
        end
      end
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

    # Writes each class to STDOUT
    def output_classes(relations)
      if @export == :json
        puts JSON.generate(relations.classes)
      else
        exporter = Exporter.new(relations, get_doc_formatter(relations))
        @parallel.each(relations.classes) do |cls|
          puts exporter.export(cls)
        end
      end
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
      src = SourceWriter.new(path, @export ? nil : :page)
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
      formatter.link_tpl = @link_tpl if @link_tpl
      formatter.img_tpl = @img_tpl if @img_tpl
      formatter.relations = relations
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
      html.gsub!("{title}", @title)
      html.gsub!("{footer}", @footer)
      html.gsub!("{extjs_path}", @extjs_path)
      html.gsub!("{append_html}", @append_html)
      html.gsub!("{guides}", @guides.to_html)
      html.gsub!("{categories}", @categories.to_html)
      FileUtils.rm(dir+"/index.html")
      File.open(dir+"/index.html", 'w') {|f| f.write(html) }
    end
  end

end
