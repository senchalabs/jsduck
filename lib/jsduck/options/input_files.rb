require 'jsduck/options/jsb'
require 'jsduck/logger'

module JsDuck
  module Options

    # Finalizes the list of input files.
    class InputFiles
      def initialize(opts)
        @opts = opts
      end

      # Expands opts.input_files (modifying its contents):
      #
      # - When file is a directory, scans all JS, SCSS files in there.
      # - When file is a .jsb3 file, extracts list of files from it.
      # - Otherwise returns array with this same input filename.
      #
      # Then excludes the files and dirs listed in opts.exclude.
      def expand!
        @opts.input_files = expand_files(@opts.input_files)
        exclude_files!(@opts.input_files, @opts.exclude)
      end

      private

      def expand_files(unexpanded_files)
        unexpanded_files.map {|fname| expand_filename(fname) }.flatten
      end

      def expand_filename(fname)
        files = []

        if File.exists?(fname)
          if File.directory?(fname)
            Dir[fname+"/**/*.{js,scss}"].each {|f| files << f }
          elsif fname =~ /\.jsb3$/
            Options::Jsb.read(fname).each {|fn| read_filenames(fn) }
          else
            files << fname
          end
        else
          Logger.warn(nil, "File not found", {:filename => fname})
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
