require 'rubygems'
require 'jsduck/js_parser'
require 'jsduck/css_parser'
require 'jsduck/aggregator'
require 'jsduck/source_formatter'
require 'jsduck/class'
require 'jsduck/tree'
require 'jsduck/tree_icons'
require 'jsduck/members'
require 'jsduck/relations'
require 'jsduck/page'
require 'jsduck/exporter'
require 'jsduck/timer'
require 'jsduck/parallel_wrap'
require 'json'
require 'fileutils'

module JsDuck

  # The main application logic of jsduck
  class App
    # These are basically input parameters for app
    attr_accessor :output_dir
    attr_accessor :template_dir
    attr_accessor :input_files
    attr_accessor :verbose
    attr_accessor :export

    def initialize
      @output_dir = nil
      @template_dir = nil
      @input_files = []
      @verbose = false
      @export = nil
      @timer = Timer.new
      @parallel = ParallelWrap.new
    end

    # Sets the nr of parallel processes to use.
    # Set to 0 to disable parallelization completely.
    def processes=(count)
      @parallel = ParallelWrap.new(:in_processes => count)
    end

    # Call this after input parameters set
    def run
      clear_dir(@output_dir)
      if @export
        FileUtils.mkdir(@output_dir)
        init_output_dirs(@output_dir)
      else
        copy_template(@template_dir, @output_dir)
      end

      parsed_files = @timer.time(:parsing) { parallel_parse(@input_files) }
      result = @timer.time(:aggregating) { aggregate(parsed_files) }
      relations = @timer.time(:aggregating) { filter_classes(result) }
      warn_globals(relations)

      if @export == :json
        @timer.time(:generating) { write_json(@output_dir+"/output", relations) }
      else
        @timer.time(:generating) { write_tree(@output_dir+"/output/tree.js", relations) }
        @timer.time(:generating) { write_members(@output_dir+"/output/members.js", relations) }
        @timer.time(:generating) { write_pages(@output_dir+"/output", relations) }
      end

      @timer.report if @verbose
    end

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      src = SourceFormatter.new(@output_dir + "/source", @export ? :format_pre : :format_page)
      @parallel.map(filenames) do |fname|
        puts "Parsing #{fname} ..." if @verbose
        code = IO.read(fname)
        {
          :filename => fname,
          :html_filename => File.basename(src.write(code, fname)),
          :data => fname =~ /\.s?css$/ ? CssParser.new(code).parse : JsParser.new(code).parse,
        }
      end
    end

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        puts "Aggregating #{file[:filename]} ..." if @verbose
        agr.aggregate(file[:data], file[:filename], file[:html_filename])
      end
      agr.classify_orphans
      agr.create_global_class
      agr.result
    end

    # Filters out class-documentations, converting them to Class objects.
    # For each other type, prints a warning message and discards it
    def filter_classes(docs)
      classes = []
      docs.each do |d|
        if d[:tagname] == :class
          classes << Class.new(d)
        else
          type = d[:tagname].to_s
          name = d[:name]
          file = d[:filename]
          line = d[:linenr]
          puts "Warning: Ignoring #{type}: #{name} in #{file} line #{line}"
        end
      end
      Relations.new(classes)
    end

    # print warning for each global member
    def warn_globals(relations)
      global = relations["global"]
      return unless global
      [:cfg, :property, :method, :event].each do |type|
        global.members(type).each do |member|
          name = member[:name]
          file = member[:filename]
          line = member[:linenr]
          puts "Warning: Global #{type}: #{name} in #{file} line #{line}"
        end
      end
    end

    # Given all classes, generates namespace tree and writes it
    # in JSON form into a file.
    def write_tree(filename, relations)
      tree = Tree.new.create(relations.classes)
      icons = TreeIcons.new.extract_icons(tree)
      js = "Docs.classData = " + JSON.generate( tree ) + ";"
      js += "Docs.icons = " + JSON.generate( icons ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
    end

    # Given all classes, generates members data for search and writes in
    # in JSON form into a file.
    def write_members(filename, relations)
      members = Members.new.create(relations.classes)
      js = "Docs.membersData = " + JSON.generate( {:data => members} ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
    end

    # Writes documentation page for each class
    # We do it in parallel using as many processes as available CPU-s
    def write_pages(path, relations)
      cache = {}
      @parallel.each(relations.classes) do |cls|
        filename = path + "/" + cls[:name] + ".html"
        puts "Writing to #{filename} ..." if @verbose
        html = Page.new(cls, relations, cache).to_html
        File.open(filename, 'w') {|f| f.write(html) }
      end
    end

    # Writes JSON export file for each class
    def write_json(path, relations)
      exporter = Exporter.new(relations)
      @parallel.each(relations.classes) do |cls|
        filename = path + "/" + cls[:name] + ".json"
        puts "Writing to #{filename} ..." if @verbose
        hash = exporter.export(cls)
        json = JSON.pretty_generate(hash)
        File.open(filename, 'w') {|f| f.write(json) }
      end
    end

    def copy_template(template_dir, dir)
      puts "Copying template files to #{dir}..." if @verbose
      FileUtils.cp_r(template_dir, dir)
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
  end

end
