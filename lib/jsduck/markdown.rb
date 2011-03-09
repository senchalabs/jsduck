require 'rubygems'
require 'jsduck/parser'
require 'jsduck/aggregator'
require 'jsduck/class'
require 'jsduck/doc_writer'
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
      @doc_writer = DocWriter.new
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

      # Regenerate the doc-comment for each class.
      # Build up search-replace list for each file.
      classes.each do |cls|
        puts "Converting #{cls[:name]} ..." if @verbose
        fname = cls[:filename]
        replacements[fname] = [] unless replacements[fname]
        replacements[fname] << {
          :orig => cls[:orig_comment],
          :new => @doc_writer.write(:class, cls),
        }
        [:cfg, :property, :method, :event].each do |type|
          cls[type].each do |m|
            unless type == :method && m[:name] == "constructor"
              replacements[fname] << {
                :orig => m[:orig_comment],
                :new => @doc_writer.write(type, m),
              }
            end
          end
        end
      end

      # Simply replace original doc-comments with generated ones.
      replacements.each do |fname, comments|
        puts "Writing #{fname} ..." if @verbose
        src = IO.read(fname)
        comments.each do |c|
          src = safe_replace(src, c[:orig], c[:new]) if c[:new]
        end
        File.open(fname, 'w') {|f| f.write(src) }
      end
    end

    # Replaces of one string with other exactly.
    #
    # String#sub expands meta-characters in replacement string, so we
    # use split + concatenate to get around that.
    def safe_replace(str, text, replacement)
      ps = str.split(text, 2)
      ps[0] + replacement + ps[1]
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
