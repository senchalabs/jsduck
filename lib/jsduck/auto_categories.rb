module JsDuck

  # Automatically divides all available classes into categories
  class AutoCategories
    def initialize(relations)
      @relations = relations
    end

    # Performs the generation
    def generate
      # list names of all public classes
      class_names = @relations.to_a.find_all {|cls| !cls[:private] }.map {|cls| cls[:name] }

      # divide classes into top-level categories by namespace
      categories = categorize(class_names)

      # in each category, create sub-categories
      categories.each_pair do |ns, classes|
        categories[ns] = categorize(classes, 1)
      end

      # Turn categories hash into array, sort everything
      categories_array = []
      categories.each_pair do |ns, groups|
        groups_array = []
        groups.each_pair do |gns, classes|
          groups_array << {
            "name" => gns,
            "classes" => classes.sort
          }
        end
        groups_array.sort! {|a, b| cat_compare(a, b) }
        categories_array << {
          "name" => ns,
          "groups" => groups_array
        }
      end
      categories_array.sort! {|a, b| cat_compare(a, b) }

      return categories_array
    end

    # Divides classes into categories by namespace.  Collapses
    # categories having only one class into a category "Others..."
    def categorize(class_names, level=0)
      categories = {}
      class_names.each do |name|
        ns = name.split(/\./)[level] || name.split(/\./)[0]
        categories[ns] = [] unless categories[ns]
        categories[ns] << name
      end

      globals = []
      categories.each_pair do |ns, classes|
        if classes.length == 1
          globals << classes[0]
          categories.delete(ns)
        end
      end
      if globals.length > 0
        categories["Others..."] = globals
      end

      categories
    end

    # Comparison function for sorting categories that always places
    # "Others..." category at the end.
    def cat_compare(a, b)
      if a["name"] == "Others..."
        1
      elsif b["name"] == "Others..."
        -1
      else
        a["name"] <=> b["name"]
      end
    end
  end

end
