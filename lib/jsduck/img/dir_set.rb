require "jsduck/img/dir"
require "jsduck/logger"
require "fileutils"

module JsDuck
  module Img

    # A collection if Img::Dir objects.
    #
    # Looks up images from directories specified through --images
    # option.
    #
    # This class provides the same interface as Img::Dir, except that
    # the constructor takes array of full_paths not just one.
    class DirSet
      def initialize(full_paths, relative_path)
        @dirs = full_paths.map {|path| Img::Dir.new(path, relative_path) }
      end

      def get(filename)
        @dirs.each do |dir|
          if img = dir.get(filename)
            return img
          end
        end
        return nil
      end

      def all_used
        @dirs.map {|dir| dir.all_used }.flatten
      end

      def report_unused
        @dirs.each {|dir| dir.report_unused }
      end
    end

  end
end
