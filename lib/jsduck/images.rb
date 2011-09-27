require "jsduck/logger"
require "fileutils"

module JsDuck

  # Looks up images from directories specified through --images option.
  class Images
    def initialize(paths)
      @paths = paths
      @images = {}
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
          Logger.instance.warn("Image #{img} not found")
        end
      end
    end

    # Attempts to copy one image, returns true on success
    def copy_img(img, output_dir)
      @paths.each do |path|
        filename = path + "/" + img
        if File.exists?(filename)
          dest = output_dir + "/" + img
          FileUtils.makedirs(File.dirname(dest))
          FileUtils.cp(filename, dest)
          Logger.instance.log("Copy #{filename} to #{dest} ...")
          return true
        end
      end
      return false
    end

  end

end
