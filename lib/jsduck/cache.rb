require 'digest/md5'
require 'fileutils'
require 'jsduck/util/null_object'

module JsDuck

  # Reads/writes parsed files in cache.
  class Cache

    # Factory method to produce a cache object.  When caching is
    # disabled, returns a NullObject which emulates a cache that's
    # always empty.
    def self.create(opts)
      # Check also for cache_dir, which will be nil when output_dir is :stdout
      if opts.cache && opts.cache_dir
        Cache.new(opts.cache_dir)
      else
        Util::NullObject.new(:read => nil, :write => nil)
      end
    end

    def initialize(cache_dir)
      @cache_dir = cache_dir
      FileUtils.mkdir_p(cache_dir) unless File.exists?(cache_dir)
    end

    # Given contents of a source file, reads the already parsed data
    # structure from cache.  Returns nil when not found.
    def read(file_contents)
      fname = file_name(file_contents)
      if File.exists?(fname)
        File.open(fname, "rb") {|file| Marshal::load(file) }
      else
        nil
      end
    end

    # Writes parse data into cache under a name generated from the
    # contents of a source file.
    def write(file_contents, data)
      fname = file_name(file_contents)
      File.open(fname, "wb") {|file| Marshal::dump(data, file) }
    end

    private

    def file_name(file_contents)
      @cache_dir + "/" + md5(file_contents) + ".dat"
    end

    def md5(string)
      Digest::MD5.hexdigest(string)
    end

  end

end
