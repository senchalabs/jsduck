require 'rubygems'
require 'jsduck/parser'
require 'jsduck/aggregator'
require 'jsduck/class'
require 'json'
require 'parallel'

module JsDuck

  # Markdown magic
  class Markdown
    # These are basically input parameters for app
    attr_accessor :input_files
    attr_accessor :verbose

    def initialize
      @input_files = []
      @verbose = false
    end

    # Call this after input parameters set
    def run
      parsed_files = parallel_parse(@input_files)
      result = aggregate(parsed_files)
      classes = filter_classes(result)
      convert_docs(classes)
    end

    def convert_docs(classes)
      replacements = {}

      classes.each do |cls|
        fname = cls[:filename]
        replacements[fname] = [] unless replacements[fname]
        replacements[fname] << {
          :orig => cls[:orig_comment],
          :new => to_comment(format_class(cls)),
        }
      end

      replacements.each do |fname, items|
        src = IO.read(fname)
        items.each do |diff|
          src.sub!(diff[:orig], diff[:new])
        end
        puts "Writing #{fname} ..." if @verbose
        File.open(fname, 'w') {|f| f.write(src) }
      end
    end

    def format_class(cls)
      return [
        "@class " + cls[:name],
        cls[:extends] ? "@extends " + cls[:extends] : nil,
        cls[:singleton] ? "@singleton" : nil,
        cls[:xtype] ? "@xtype " + cls[:xtype] : nil,
        "",
        html2text(cls[:doc]),
        format_constructor(cls),
      ].flatten.compact.join("\n") + "\n"
    end

    def format_constructor(cls)
      con = cls[:method].find {|m| m[:name] == "constructor" }
      return nil if !con

      return [
        "",
        "@constructor",
        html2text(con[:doc]),
        con[:params].map {|p| format_param(p) }
      ]
    end

    def format_param(p)
      return [
        "@param",
        p[:type] ? "{"+p[:type]+"}" : nil,
        p[:name],
        html2text(p[:doc]),
      ].compact.join(" ")
    end

    def html2text(html)
      File.open("temp.html", 'w') {|f| f.write(html) }
      `python html2text.py temp.html > temp.text`
      text = IO.read("temp.text")
      FileUtils.rm("temp.html")
      FileUtils.rm("temp.text")
      return text.strip
    end

    # surrounds text with /** ... */
    def to_comment(text)
      com = []
      com << "/**\n"
      text.each_line do |line|
        com << " * " + line
      end
      com << " */"
      com.join("")
    end

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      Parallel.map(filenames) do |fname|
        puts "Parsing #{fname} ..." if @verbose
        code = IO.read(fname)
        {
          :filename => fname,
          :html_filename => "",
          :data => Parser.new(code).parse,
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
      agr.result
    end

    # Filters out class-documentations, converting them to Class objects.
    # For each other type, prints a warning message and discards it
    def filter_classes(docs)
      classes = {}
      docs.each do |d|
        if d[:tagname] == :class
          classes[d[:name]] = Class.new(d, classes)
        else
          type = d[:tagname].to_s
          name = d[:name]
          file = d[:filename]
          line = d[:linenr]
          puts "Warning: Ignoring #{type}: #{name} in #{file} line #{line}"
        end
      end
      classes.values
    end

  end

end
