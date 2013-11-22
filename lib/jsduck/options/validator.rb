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
        input_files_present
        output_dir_present
        valid_export_format
        template_files_present
        valid_guides_toc_level
      end

      private

      def input_files_present
        if @opts.input_files.empty? && !@opts.welcome && !@opts.guides && !@opts.videos && !@opts.examples
          fatal("Please specify some input files, otherwise there's nothing I can do :(")
        end
      end

      def output_dir_present
        if @opts.output_dir == :stdout
          # No output dir needed for export
          if !@opts.export
            fatal("Output to STDOUT only works when using --export option")
          end
        elsif !@opts.output_dir
          fatal("Please specify an output directory, where to write all this amazing documentation")
        elsif File.exists?(@opts.output_dir) && !File.directory?(@opts.output_dir)
          fatal("The output directory is not really a directory at all :(")
        elsif !File.exists?(File.dirname(@opts.output_dir))
          fatal("The parent directory for #{@opts.output_dir} doesn't exist")
        end
      end

      def valid_export_format
        if ![nil, :full, :examples].include?(@opts.export)
          fatal("Unknown export format: #{@export}")
        end
      end

      def template_files_present
        if @opts.export
          # Don't check these things when exporting
        elsif !File.exists?(@opts.template_dir + "/extjs")
          fatal("Oh noes!  The template directory does not contain extjs/ directory :(")
          fatal("Please copy ExtJS over to template/extjs or create symlink.")
          fatal("For example:")
          fatal("    $ cp -r /path/to/ext-4.0.0 " + @opts.template_dir + "/extjs")
        elsif !File.exists?(@opts.template_dir + "/resources/css")
          fatal("Oh noes!  CSS files for custom ExtJS theme missing :(")
          fatal("Please compile SASS files in template/resources/sass with compass.")
          fatal("For example:")
          fatal("    $ compass compile " + @opts.template_dir + "/resources/sass")
        end
      end

      def valid_guides_toc_level
        if !(1..6).include?(@opts.guides_toc_level)
          fatal("Unsupported --guides-toc-level: '#{@opts.guides_toc_level}'")
        end
      end

      def fatal(smg)
        Logger.fatal(msg)
        exit(1)
      end

    end

  end
end
