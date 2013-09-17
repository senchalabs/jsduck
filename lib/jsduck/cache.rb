require 'digest/md5'
require 'fileutils'
require 'jsduck/util/null_object'
require 'set'

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
        Util::NullObject.new(
          :read => nil,
          :write => nil,
          :previous_entry => nil,
          :cleanup => nil
          )
      end
    end

    # The name of the cache file that was previously read or written.
    # When the #read call failed to find the file, it will be nil.
    # But it will always be available after the #write call.
    attr_reader :previous_entry

    def initialize(cache_dir)
      @cache_dir = cache_dir
      @previous_entry = nil
      FileUtils.mkdir_p(cache_dir) unless File.exists?(cache_dir)
    end

    # Given contents of a source file, reads the already parsed data
    # structure from cache.  Returns nil when not found.
    def read(file_contents)
      fname = file_name(file_contents)
      if File.exists?(fname)
        @previous_entry = fname
        File.open(fname, "rb") {|file| Marshal::load(file) }
      else
        @previous_entry = nil
        nil
      end
    end

    # Writes parse data into cache under a name generated from the
    # contents of a source file.
    def write(file_contents, data)
      fname = file_name(file_contents)
      @previous_entry = fname
      File.open(fname, "wb") {|file| Marshal::dump(data, file) }
    end

    # Given listing of used cache files (those that were either read
    # or written during this jsduck run) removes rest of the files
    # from cache directory that were unused.
    def cleanup(used_cache_entries)
      used = Set.new(used_cache_entries)

      Dir[@cache_dir + "/*.dat"].each do |file|
        FileUtils.rm_rf(file) unless used.include?(file)
      end
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
