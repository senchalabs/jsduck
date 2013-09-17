require 'fileutils'

module JsDuck
  # Cleans up the output dir from previous JSDuck run.  If the output
  # dir contains a .cache directory (and this dir is currently used
  # for caching), it gets preserved, otherwise just an empty output
  # dir is created.
  class OutputDir

    # Initializes empty output directory (with optional .cache inside).
    def self.clean(opts)
      if opts.cache && cache_dir_needs_preserving(opts)
        # Remove all files inside <output-dir> except .cache/
        Dir[opts.output_dir + "/*"].each do |file|
          FileUtils.rm_rf(file) unless file =~ /\/.cache\z/
        end
      else
        # Remove and recreate the entire <output-dir>
        FileUtils.rm_rf(opts.output_dir)
        FileUtils.mkdir(opts.output_dir)
      end
    end

    def self.cache_dir_needs_preserving(opts)
      opts.cache_dir == opts.output_dir + "/.cache" && File.exists?(opts.cache_dir)
    end

  end
end
