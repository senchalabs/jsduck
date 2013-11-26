require 'jsduck/options/parser'
require 'jsduck/options/input_files'
require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/io'
require 'jsduck/util/parallel'
require 'jsduck/tag_registry'
require 'jsduck/js/ext_patterns'

module JsDuck
  module Options

    # A facade for all the command line options processing.
    class Processor
      # Takes a list of command line options, parses it to an
      # Options::Record object, validates the options, applies it to
      # various singleton classes and returns the Options::Record.
      def self.process(args)
        # HACK! First establish warnings defaults.
        Logger.configure_defaults

        opts = Options::Parser.new.parse(args)

        # Expand list of input files
        Options::InputFiles.new(opts).expand!

        # Validate the options.
        # Exit program when there's an error.
        if err = opts.validate!
          Array(err).each {|line| Logger.fatal(line) }
          exit(1)
        end

        # Configure various objects with these options
        Logger.configure(opts)
        Util::Parallel.configure(opts)
        TagRegistry.configure(opts)
        Js::ExtPatterns.configure(opts)
        Util::Json.configure(opts)
        Util::IO.configure(opts)

        opts
      end
    end

  end
end
