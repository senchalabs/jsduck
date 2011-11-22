require 'rubygems'
require 'jsduck/source_file'
require 'jsduck/aggregator'
require 'jsduck/class'
require 'jsduck/doc_writer'
require 'jsduck/logger'
require 'jsduck/parallel_wrap'
require 'jsduck/relations'
require 'json'
require 'pp'

module JsDuck

  # Markdown magic
  class Markdown
    # These are basically input parameters for app
    attr_accessor :input_files

    def initialize
      @input_files = []
      @doc_writer = DocWriter.new
      @parallel = ParallelWrap.new
    end

    # Sets verbose mode on or off
    def verbose=(enabled)
      Logger.instance.verbose = enabled
    end

    # Call this after input parameters set
    def run
      parsed_files = parallel_parse(@input_files)
      result = aggregate(parsed_files)
      relations = filter_classes(result)
      convert_docs(relations)
    end

    def convert_docs(relations)
      replacements = {}

      # Regenerate the doc-comment for each class.
      # Build up search-replace list for each file.
      relations.each do |cls|
        Logger.instance.log("Converting #{cls[:name]} ...")
        fname = cls[:files][0][:filename]
        if fname && fname.length > 0
          replacements[fname] = [] unless replacements[fname]
          replacements[fname] << {
            :orig => cls[:orig_comment],
            :new => @doc_writer.write(:class, cls),
          }
        end
        cls.all_local_members.each do |m|
          unless m[:tagname] == :method && m[:name] == "constructor" || m[:private]
            fname = m[:files][0][:filename]
            replacements[fname] = [] unless replacements[fname]
            replacements[fname] << {
              :orig => m[:orig_comment],
              :new => @doc_writer.write(m[:tagname], m),
            }
          end
        end
      end

      # Simply replace original doc-comments with generated ones.
      replacements.each do |fname, comments|
        Logger.instance.log("Writing #{fname} ...")
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
      if ps.length == 1
        puts text
      end
      ps[0] + replacement + ps[1]
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
      agr.result
    end

    # Filters out class-documentations, converting them to Class objects.
    # For each other type, prints a warning message and discards it
    def filter_classes(docs)
      classes = []
      docs.each do |d|
        if d[:tagname] == :class
          classes << Class.new(d) if !d[:private]
        else
          type = d[:tagname].to_s
          name = d[:name]
          file = d[:filename]
          line = d[:linenr]
          Logger.instance.warn("Ignoring #{type}: #{name} in #{file} line #{line}")
        end
      end
      Relations.new(classes)
    end

  end

end
