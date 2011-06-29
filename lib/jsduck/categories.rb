require 'jsduck/logger'
require 'json'

module JsDuck

  # Reads in categories and outputs JSON file
  class Categories
    def initialize
      @overview = {"organisation" => [], "categories" => {}}
    end

    # Parses categories in JSON file
    def parse(path)
      @overview = JSON.parse(IO.read(path))
    end

    # Prints warnings for missing classes in categories file
    def validate(relations)
      overview_classes = {}

      # Check that each class listed in overview file exists
      @overview["categories"].each_pair do |cat_name, cat|
        cat["classes"].each do |cls_name|
          unless relations[cls_name]
            Logger.instance.warn("Class '#{cls_name}' in category '#{cat_name}' not found")
          end
          overview_classes[cls_name] = true
        end
      end

      # Check that each existing non-private class is listed in overview file
      relations.each do |cls|
        unless overview_classes[cls[:name]] || cls[:private]
          Logger.instance.warn("Class '#{cls[:name]}' not found in overview file")
        end
      end
    end

    # Writes the categories as JavaScript file
    def write(filename)
      js = "Docs.overviewData = " + JSON.generate( @overview ) + ";"
      File.open(filename, 'w') {|f| f.write(js) }
    end

  end

end
