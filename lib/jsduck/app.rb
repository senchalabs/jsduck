require 'rubygems'
require 'jsduck/aggregator'
require 'jsduck/source_file'
require 'jsduck/source_writer'
require 'jsduck/doc_formatter'
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
    attr_accessor :guides_dir
    attr_accessor :template_links
    attr_accessor :input_files
    attr_accessor :verbose
    attr_accessor :export
    attr_accessor :link_tpl
    attr_accessor :img_tpl
    attr_accessor :ignore_global
    attr_accessor :external_classes

    def initialize
      @output_dir = nil
      @template_dir = nil
      @guides_dir = nil
      @template_links = false
      @input_files = []
      @verbose = false
      @export = nil
      @link_tpl = nil
      @img_tpl = nil
      @ignore_global = false
      @external_classes = []
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
      parsed_files = @timer.time(:parsing) { parallel_parse(@input_files) }
      result = @timer.time(:aggregating) { aggregate(parsed_files) }
      relations = @timer.time(:aggregating) { filter_classes(result) }
      warn_globals(relations)
      warn_unnamed(relations)

      clear_dir(@output_dir)
      if @export == :json
        FileUtils.mkdir(@output_dir)
        init_output_dirs(@output_dir)
        @timer.time(:generating) { write_src(@output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_class(@output_dir+"/output", relations) }
      else
        if @template_links
          link_template(@template_dir, @output_dir)
        else
          copy_template(@template_dir, @output_dir)
        end
        @timer.time(:generating) { write_src(@output_dir+"/source", parsed_files) }
        @timer.time(:generating) { write_tree(@output_dir+"/output/tree.js", relations) }
        @timer.time(:generating) { write_members(@output_dir+"/output/members.js", relations) }
        @timer.time(:generating) { write_class(@output_dir+"/output", relations) }
        @timer.time(:generating) { write_overview(@output_dir+"/output/overviewData.js", relations) }
        if @guides_dir
          @timer.time(:generating) { write_guides(@guides_dir, @output_dir+"/guides", relations) }
        end
      end

      @timer.report if @verbose
    end

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      @parallel.map(filenames) do |fname|
        puts "Parsing #{fname} ..." if @verbose
        SourceFile.new(IO.read(fname), fname)
      end
    end

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        puts "Aggregating #{file.filename} ..." if @verbose
        agr.aggregate(file)
      end
      agr.classify_orphans
      agr.create_global_class unless @ignore_global
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
      Relations.new(classes, @external_classes)
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

    # print warning for each member with no name
    def warn_unnamed(relations)
      relations.each do |cls|
        [:cfg, :property, :method, :event].each do |type|
          cls[type].each do |member|
            if !member[:name] || member[:name] == ""
              file = member[:filename]
              line = member[:linenr]
              puts "Warning: Unnamed #{type} in #{file} line #{line}"
            end
          end
        end
      end
    end

    # prints warnings for missing classes in overviewData.json file,
    # and writes overviewData to .js file
    def write_overview(filename, relations)
      overview = JSON.parse(IO.read(@template_dir+"/overviewData.json"))
      overview_classes = {}

      # Check that each class listed in overview file exists
      overview["categories"].each_pair do |cat_name, cat|
        cat["classes"].each do |cls_name|
          unless relations[cls_name]
            puts "Warning: Class '#{cls_name}' in category '#{cat_name}' not found"
          end
          overview_classes[cls_name] = true
        end
      end

      # Check that each existing non-private class is listed in overview file
      relations.each do |cls|
        unless overview_classes[cls[:name]] || cls[:private]
          puts "Warning: Class '#{cls[:name]}' not found in overview file"
        end
      end

      js = "Docs.overviewData = " + JSON.generate( overview ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
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
        page = Page.new(cls, relations, cache)
        page.link_tpl = @link_tpl if @link_tpl
        page.img_tpl = @img_tpl if @img_tpl
        File.open(filename, 'w') {|f| f.write(page.to_html) }
      end
    end

    # Writes JsonP export file for each class
    def write_class(path, relations)
      exporter = Exporter.new(relations, get_doc_formatter(relations))
      @parallel.each(relations.classes) do |cls|
        filename = path + "/" + cls[:name] + ".js"
        puts "Writing to #{filename} ..." if @verbose
        write_jsonp_file(filename, cls[:name].gsub(/\./, "_"), exporter.export(cls))
      end
    end

    # Writes formatted HTML source code for each input file
    def write_src(path, parsed_files)
      src = SourceWriter.new(path, @export ? nil : :page)
      # Can't be done in parallel, because file.html_filename= method
      # updates all the doc-objects related to the file
      parsed_files.each do |file|
        html_filename = src.write(file.to_html, file.filename)
        puts "Writing to #{html_filename} ..." if @verbose
        file.html_filename = File.basename(html_filename)
      end
    end

    # Writes JsonP export file for each guide
    def write_guides(in_path, out_path, relations)
      formatter = get_doc_formatter(relations)
      FileUtils.mkdir(out_path)
      Dir.glob(in_path + "/*").each do |in_dir|
        if File.directory?(in_dir)
          guide_name = File.basename(in_dir)
          out_dir = out_path + "/" + guide_name
          puts "Creating guide #{out_dir} ..." if @verbose
          FileUtils.cp_r(in_dir, out_dir)
          formatter.doc_context = {:filename => out_dir + "/README.md", :linenr => 0}
          guide = formatter.format(IO.read(out_dir + "/README.md"))
          guide.gsub!(/<img src="/, "<img src=\"guides/#{guide_name}/")
          write_jsonp_file(out_dir+"/README.js", guide_name, {:guide => guide})
          FileUtils.rm(out_dir + "/README.md")
        end
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

    # Turns hash into JSON and writes inside JavaScript that calls the
    # given callback name
    def write_jsonp_file(filename, callback_name, data)
      jsonp = "Ext.data.JsonP." + callback_name + "(" + JSON.pretty_generate(data) + ");"
      File.open(filename, 'w') {|f| f.write(jsonp) }
    end

    def copy_template(template_dir, dir)
      puts "Copying template files to #{dir}..." if @verbose
      FileUtils.cp_r(template_dir, dir)
      init_output_dirs(dir)
    end

    def link_template(template_dir, dir)
      puts "Linking template files to #{dir}..." if @verbose
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
  end

end
