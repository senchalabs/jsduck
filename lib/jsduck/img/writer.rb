require "jsduck/logger"
require "fileutils"

module JsDuck
  module Img

    # Copies images to destination directory.
    class Writer
      # Takes an array of image records retrieved from
      # Img::Dir#all_used or Img::DirSet#all_used and copies all of
      # them to given output directory.
      def self.copy(images, output_dir)
        images.each do |img|
          dest = File.join(output_dir, img[:filename])
          Logger.log("Copying image", dest)
          FileUtils.makedirs(File.dirname(dest))
          FileUtils.cp(img[:full_path], dest)
        end
      end
    end

  end
end
