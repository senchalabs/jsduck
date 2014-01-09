require 'jsduck/util/parallel'
require 'jsduck/util/io'
require 'jsduck/source/file'
require 'jsduck/aggregator'
require 'jsduck/class'
require 'jsduck/relations'
require 'jsduck/logger'
require 'jsduck/inherit_doc'
require 'jsduck/importer'
require 'jsduck/return_values'
require 'jsduck/lint'
require 'jsduck/rest_file'
require 'jsduck/circular_deps'

module JsDuck

  # Performs the parsing of all input files.  Input files are read
  # from options object (originating from command line).
  class BatchParser
    def initialize(opts)
      @opts = opts
    end

    # Array of Source::File objects.
    # Available after calling the #run method.
    attr_reader :parsed_files

    # Parses the files and returns instance of Relations class.
    def run
      @parsed_files = parallel_parse(@opts.input_files)
      result = aggregate(@parsed_files)
      @relations = filter_classes(result)
      if ! @opts.rest
        apply_extra_processing
      end
      return @relations
    end

    private

    # Parses the files in parallel using as many processes as available CPU-s
    def parallel_parse(filenames)
      Util::Parallel.map(filenames) do |fname|
        Logger.log("Parsing", fname)
        begin
          if @opts.rest
            RestFile.new(Util::IO.read(fname), fname, @opts)
          else
            Source::File.new(Util::IO.read(fname), fname, @opts)
          end
        rescue
          Logger.fatal_backtrace("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
    end

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        Logger.log("Aggregating", file.filename)
        agr.aggregate(file)
      end
      if ! @opts.rest
        agr.classify_orphans
        agr.create_global_class
        agr.remove_ignored_classes
        agr.create_accessors
      end
      if @opts.ext4_events == true || (@opts.ext4_events == nil && agr.ext4?)
        agr.append_ext4_event_options
      end
      agr.process_enums
      # Ignore override classes after applying them to actual classes
      @opts.external_classes += agr.process_overrides.map {|o| o[:name] }
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
            Logger.warn(:global, "Global #{type}: #{name}", file[:filename], file[:linenr])
          end
        end
      end
      Relations.new(classes, @opts.external_classes)
    end

    # Do all kinds of post-processing on relations.
    def apply_extra_processing
      CircularDeps.new(@relations).check_all
      InheritDoc.new(@relations).resolve_all
      Importer.import(@opts.imports, @relations, @opts.new_since)
      ReturnValues.auto_detect(@relations)
      Lint.new(@relations).run
    end

  end

end
