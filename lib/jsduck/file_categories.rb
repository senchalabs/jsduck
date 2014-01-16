require 'jsduck/logger'
require 'jsduck/util/json'

module JsDuck

  # Reads categories info from config file
  class FileCategories
    def initialize(filename, relations)
      @filename = filename
      @relations = relations
    end

    # Parses categories in JSON file
    def generate
      @categories = Util::Json.read(@filename)

      # Don't crash if old syntax is used.
      if @categories.is_a?(Hash) && @categories["categories"]
        Logger.warn(nil, 'Update categories file to contain just the array inside {"categories": [...]}', @filename)
        @categories = @categories["categories"]
      end

      # Perform expansion on all class names containing * wildcard
      @categories.each do |cat|
        cat["groups"].each do |group|
          group["classes"] = group["classes"].map do |name|
            expand(name)
          end.flatten
        end
      end

      validate

      @categories
    end

    # Expands class name like 'Foo.*' into multiple class names.
    def expand(name)
      re = Regexp.new("^" + name.split(/\*/, -1).map {|part| Regexp.escape(part) }.join('.*') + "$")

      classes = @relations.to_a.find_all do |cls|
        re =~ cls[:name] && !cls[:private] && !deprecated?(cls)
      end.map {|cls| cls[:name] }.sort

      if classes.length == 0
        Logger.warn(:cat_no_match, "No class found matching a pattern '#{name}' in categories file", @filename)
      end
      classes
    end

    # Prints warnings for missing classes in categories file
    def validate
      # Build a map of all classes listed in categories
      listed_classes = {}
      @categories.each do |cat|
        cat["groups"].each do |group|
          group["classes"].each do |cls_name|
            listed_classes[cls_name] = true
          end
        end
      end

      # Check that each existing non-private & non-deprecated class is listed
      @relations.each do |cls|
        unless listed_classes[cls[:name]] || cls[:private] || deprecated?(cls)
          Logger.warn(:cat_class_missing, "Class '#{cls[:name]}' not found in categories file", @filename)
        end
      end
    end

    def deprecated?(cls)
      cls[:meta] && cls[:meta][:deprecated]
    end
  end

end
