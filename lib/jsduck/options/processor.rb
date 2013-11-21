require 'jsduck/options/jsb'
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

        Util::Json.pretty = true if @opts.pretty_json
        JsDuck::Util::IO.encoding = @opts.encoding if @opts.encoding

        validate

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

      # Runs checks on the options
      def validate
        if @opts.input_files.length == 0 && !@opts.welcome && !@opts.guides && !@opts.videos && !@opts.examples
          Logger.fatal("You should specify some input files, otherwise there's nothing I can do :(")
          exit(1)
        elsif @opts.output_dir == :stdout && !@opts.export
          Logger.fatal("Output to STDOUT only works when using --export option")
          exit(1)
        elsif ![nil, :full, :api, :examples].include?(@opts.export)
          Logger.fatal("Unknown export format: #{@export}")
          exit(1)
        elsif @opts.output_dir != :stdout
          if !@opts.output_dir
            Logger.fatal("You should also specify an output directory, where I could write all this amazing documentation")
            exit(1)
          elsif File.exists?(@opts.output_dir) && !File.directory?(@opts.output_dir)
            Logger.fatal("The output directory is not really a directory at all :(")
            exit(1)
          elsif !File.exists?(File.dirname(@opts.output_dir))
            Logger.fatal("The parent directory for #{@opts.output_dir} doesn't exist")
            exit(1)
          elsif !@opts.export && !File.exists?(@opts.template_dir + "/extjs")
            Logger.fatal("Oh noes!  The template directory does not contain extjs/ directory :(")
            Logger.fatal("Please copy ExtJS over to template/extjs or create symlink.")
            Logger.fatal("For example:")
            Logger.fatal("    $ cp -r /path/to/ext-4.0.0 " + @opts.template_dir + "/extjs")
            exit(1)
          elsif !@opts.export && !File.exists?(@opts.template_dir + "/resources/css")
            Logger.fatal("Oh noes!  CSS files for custom ExtJS theme missing :(")
            Logger.fatal("Please compile SASS files in template/resources/sass with compass.")
            Logger.fatal("For example:")
            Logger.fatal("    $ compass compile " + @opts.template_dir + "/resources/sass")
            exit(1)
          end
        end
      end

    end

  end
end
