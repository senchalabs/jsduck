require 'jsduck/options/input_files'
require 'jsduck/options/validator'
require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/io'
require 'jsduck/util/parallel'
require 'jsduck/tag_registry'
require 'jsduck/js/ext_patterns'

module JsDuck
  module Options

    # Handles setting different settings based on the commend line
    # options and also processes some of the options (like #input_files).
    # Finally it also validates them.
    class Processor
      # Processes and applies the parsed command line options.
      # Also modifies the values of#input_files option.
      def self.process!(opts)
        # Expand list of input files
        Options::InputFiles.new(opts).expand!

        # Configure various objects with these options
        Logger.configure(opts)
        Util::Parallel.configure(opts)
        TagRegistry.configure(opts)
        Js::ExtPatterns.configure(opts)
        Util::Json.configure(opts)
        Util::IO.configure(opts)

        Options::Validator.new(opts).validate!
      end
    end

  end
end
