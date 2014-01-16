require 'digest/md5'
require 'jsduck/util/singleton'

module JsDuck
  module Util

    # Helper to rename files so that the MD5 hash of their contents is
    # placed into their name.
    class MD5
      include Util::Singleton

      # Calculates MD5 hash of a file and renames the file to contain the
      # hash inside the filename.  Returns the new name of the file.
      def rename(fname)
        hash = Digest::MD5.file(fname).hexdigest
        hashed_name = inject_hash_to_filename(fname, hash)
        File.rename(fname, hashed_name)
        return hashed_name
      end

      private

      # Given filename "foo/bar.js" and hash "HASH" produces "foo/bar-HASH.js"
      def inject_hash_to_filename(fname, hash)
        parts = File.basename(fname).split(/\./)
        parts[0] += "-" + hash
        File.dirname(fname) + "/" + parts.join(".")
      end
    end

  end
end
