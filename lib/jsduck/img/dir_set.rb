require "jsduck/img/dir"
require "jsduck/logger"
require "fileutils"

module JsDuck
  module Img

    # Looks up images from directories specified through --images option.
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

      # Copys over images to given output dir
      def copy(output_dir)
        all_used.each {|img| copy_img(img, output_dir) }
      end

      private

      # Copy a single image
      def copy_img(img, output_dir)
        dest = File.join(output_dir, img[:filename])
        Logger.log("Copying image", dest)
        FileUtils.makedirs(File.dirname(dest))
        FileUtils.cp(img[:full_path], dest)
      end

    end

  end
end
