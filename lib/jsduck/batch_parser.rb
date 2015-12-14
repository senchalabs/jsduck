require 'jsduck/util/parallel'
require 'jsduck/util/io'
require 'jsduck/parser'
require 'jsduck/source/file'
require 'jsduck/logger'
<<<<<<< HEAD
require 'jsduck/inherit_doc'
require 'jsduck/importer'
require 'jsduck/return_values'
require 'jsduck/lint'
require 'jsduck/rest_file'
require 'jsduck/circular_deps'
=======
require 'jsduck/cache'
>>>>>>> senchalabs/master

module JsDuck

  # Parses of all input files.  Input files are read from options
  # object (originating from command line).
  class BatchParser

<<<<<<< HEAD
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
=======
    def self.parse(opts)
      cache = Cache.create(opts)
>>>>>>> senchalabs/master

      results = Util::Parallel.map(opts.input_files) do |fname|
        Logger.log("Parsing", fname)

        begin
<<<<<<< HEAD
          if @opts.rest
            RestFile.new(Util::IO.read(fname), fname, @opts)
          else
            Source::File.new(Util::IO.read(fname), fname, @opts)
          end
=======
          source = Util::IO.read(fname)
          docs = nil

          unless docs = cache.read(fname, source)
            docs = Parser.new.parse(source, fname, opts)
            cache.write(fname, source, docs)
          end

          {
            :file => Source::File.new(source, docs, fname),
            :cache => cache.previous_entry,
          }
>>>>>>> senchalabs/master
        rescue
          Logger.fatal_backtrace("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
<<<<<<< HEAD
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
=======
>>>>>>> senchalabs/master

      cache.cleanup( results.map {|r| r[:cache] }.compact )

      return results.map {|r| r[:file] }
    end

  end

end
