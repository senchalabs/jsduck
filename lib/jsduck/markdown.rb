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
      list_docs(classes)
    end

    def list_docs(classes)
      classes.each do |cls|
        puts to_comment(format_class(cls))
      end
    end

    def format_class(cls)
      return [
        "@class " + cls[:name],
        cls[:extends] ? "@extends " + cls[:extends] : nil,
        cls[:singleton] ? "@singleton" : nil,
        html2text(cls[:doc]),
      ].compact.join("\n")
    end

    def html2text(html)
      File.open("temp.html", 'w') {|f| f.write(html) }
      `python html2text.py temp.html > temp.text`
      text = IO.read("temp.text")
      FileUtils.rm("temp.html")
      FileUtils.rm("temp.text")
      return text
    end

    # surrounds text with /** ... */
    def to_comment(text)
      com = []
      com << "/**\n"
      text.each_line do |line|
        com << " * " + line
      end
      com << " */\n"
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
