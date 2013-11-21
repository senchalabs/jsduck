require 'jsduck/logger'

module JsDuck
  module Options

    # Validates command line options.
    class Validator
      def initialize(opts)
        @opts = opts
      end

      # Checks for fatal problems in command line options.
      # Exits with error message when such problem found.
      def validate!
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
