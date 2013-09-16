require 'digest/md5'
require 'fileutils'

module JsDuck

  # Reads/writes parsed files in cache.
  class Cache
    def initialize(cache_dir)
      @cache_dir = cache_dir
      FileUtils.mkdir(cache_dir) unless File.exists?(cache_dir)
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
