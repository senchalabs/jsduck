require 'jsduck/util/parallel'
require 'jsduck/util/io'
require 'jsduck/parser'
require 'jsduck/source/file'
require 'jsduck/logger'
require 'jsduck/cache'

module JsDuck

  # Parses of all input files.  Input files are read from options
  # object (originating from command line).
  class BatchParser

    def self.parse(opts)
      cache = Cache.new(Dir.getwd + "/.cache")

      Util::Parallel.map(opts.input_files) do |fname|
        Logger.log("Parsing", fname)
        begin
          source = Util::IO.read(fname)
          docs = nil
          unless docs = cache.read(source)
            docs = Parser.new.parse(source, fname, opts)
            cache.write(source, docs)
          end
          Source::File.new(source, docs, fname)
        rescue
          Logger.fatal_backtrace("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
    end

  end

end
