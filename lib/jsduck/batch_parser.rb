require 'jsduck/util/parallel'
require 'jsduck/util/io'
require 'jsduck/source/file'
require 'jsduck/logger'

module JsDuck

  # Parses of all input files.  Input files are read from options
  # object (originating from command line).
  class BatchParser

    def self.parse(opts)
      Util::Parallel.map(opts.input_files) do |fname|
        Logger.log("Parsing", fname)
        begin
          Source::File.new(Util::IO.read(fname), fname, opts)
        rescue
          Logger.fatal_backtrace("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
    end

  end

end
