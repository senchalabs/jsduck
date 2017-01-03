require 'dimensions'
require 'jsduck/logger'

module JsDuck
  module Img

    # Looks up images from a directory.
    class Dir
      def initialize(full_path, relative_path)
        @full_path = full_path
        @relative_path = relative_path
        @images = {}
      end

      # Retrieves hash of information for a given relative image
      # filename.  It will have the fields:
      #
      # - :filename - the same as the parameter of this method
      # - :full_path - actual path in the filesystem.
      # - :relative_path - relative path to be used inside <img> tag.
      # - :width - Image width
      # - :height - Image height
      #
      # When the image is not found, returns nil.
      def get(filename)
        img = scan_img(filename)
        if img
          @images[filename] = img
        end
        img
      end

      # Returns all used images.
      def all_used
        @images.values
      end

      # Print warnings about all unused images.
      def report_unused
        scan_for_unused_images.each {|img| warn_unused(img) }
      end

      private

      def scan_img(filename)
        full_path = File.join(@full_path, filename)
        if File.exists?(File.join(@full_path, filename))
          img_record(filename)
        else
          nil
        end
      end

      # Scans directory for image files, building a hash of image files
      # found in that directory.
      def scan_for_unused_images
        unused = []
        ::Dir[@full_path+"/**/*.{png,jpg,jpeg,gif}"].each do |path|
          filename = relative_path(@full_path, path)
          unused << img_record(filename) unless @images[filename]
        end
        unused
      end

      def warn_unused(img)
        Logger.warn(:image_unused, "Image not used.", img[:full_path])
      end

      def img_record(filename)
        full_path = File.join(@full_path, filename)
        width, height = Dimensions.dimensions(full_path)

        return {
          :filename => filename,
          :relative_path => File.join(@relative_path, filename),
          :full_path => full_path,
          :width => width,
          :height => height,
        }
      end

      # Given a path to directory and a path to file, returns the path
      # to this file relative to the given dir. For example:
      #
      #     base_path("/foo/bar", "/foo/bar/baz/img.jpg") --> "baz/img.jpg"
      #
      def relative_path(dir_path, file_path)
        file_path.slice(dir_path.length+1, file_path.length)
      end

    end

  end
end
