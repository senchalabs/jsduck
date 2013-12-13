require "jsduck/logger"
require "fileutils"

module JsDuck

  # Looks up images from directories specified through --images option.
  class Images
    def initialize(paths)
      @paths = scan_for_images(paths)
      @images = {}
    end

    # Scans each path for image files, building a hash of paths where
    # each path points to a hash of image files found in that path.
    def scan_for_images(paths)
      map = {}
      paths.each do |path|
        # Scans directory for image files
        map[path] = {}
        Dir[path+"/**/*.{png,jpg,jpeg,gif}"].each do |img|
          map[path][img] = false
        end
      end
      map
    end

    # Adds relative image path of an image
    def add(filename)
      unless @images[filename]
        @images[filename] = true
      end
    end

    # Copys over images to given output dir
    def copy(output_dir)
      @images.each_key do |img|
        unless copy_img(img, output_dir)
          Logger.warn(:image, "Image not found.", img)
        end
      end
      report_unused
    end

    # Attempts to copy one image, returns true on success
    def copy_img(img, output_dir)
      @paths.each_pair do |path, map|
        filename = path + "/" + img
        if map.has_key?(filename)
          dest = output_dir + "/" + img
          Logger.log("Copying image", dest)
          FileUtils.makedirs(File.dirname(dest))
          FileUtils.cp(filename, dest)
          # mark file as used.
          map[filename] = true
          return true
        end
      end
      return false
    end

    # Report unused images
    def report_unused
      @paths.each_pair do |path, map|
        map.each_pair do |img, used|
          Logger.warn(:image_unused, "Image not used.", img) unless used
        end
      end
    end

  end

end
