require 'jsduck/options/jsb'
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
      # It modifies the values of#input_files option.
      def process!(opts)
        @opts = opts

        # Expand list of input files
        configure_input_files

        # Configure various objects with these options
        Logger.configure(@opts)
        Util::Parallel.configure(@opts)
        TagRegistry.configure(@opts)
        Js::ExtPatterns.configure(@opts)
        Util::Json.configure(@opts)
        Util::IO.configure(@opts)

        Options::Validator.new(@opts).validate!

        @opts
      end

      private

      def configure_input_files
        @opts.input_files = expand_files(@opts.input_files)
        exclude_files!(@opts.input_files, @opts.exclude)
      end

      # Expands directories and .jsb3 files in given list of filenames
      def expand_files(unexpanded_files)
        unexpanded_files.map {|fname| expand_filename(fname) }.flatten
      end

      # When file is a directory, scans all JS, CSS, SCSS files in there.
      # When file is a .jsb3 file, extracts list of files from it.
      # Otherwise returns array with this same input filename.
      def expand_filename(fname)
        files = []

        if File.exists?(fname)
          if File.directory?(fname)
            Dir[fname+"/**/*.{js,css,scss}"].each {|f| files << f }
          elsif fname =~ /\.jsb3$/
            Options::Jsb.read(fname).each {|fn| read_filenames(fn) }
          else
            files << fname
          end
        else
          Logger.warn(nil, "File not found", fname)
        end

        files
      end

      # Removes the files matching exclude_paths from list of files
      def exclude_files!(files, exclude_paths)
        exclude_paths.each do |exclude_path|
          exclude_re = Regexp.new('\A' + Regexp.escape(exclude_path))
          files.reject! {|f| f =~ exclude_re }
        end
      end

    end

  end
end
