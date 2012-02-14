require 'jsduck/logger'

module JsDuck

  # Parent class for assets that consist of groups.
  # That is: guides, vides, examples.
  #
  # Subclasses must initialize @groups before calling any of the
  # methods in this class.
  class GroupedAsset
    # Should be called from constructor after @groups have been read in,
    # and after it's been ensured that all items in groupes have names.
    def build_map_by_name(warning_msg)
      @map_by_name = {}
      each_item do |item|
        if @map_by_name[item["name"]]
          Logger.instance.warn(nil, "#{warning_msg} '#{item['name']}'")
        end
        @map_by_name[item["name"]] = item
      end
    end

    # Accesses item by name
    def [](name)
      @map_by_name[name]
    end

    # Iterates over all items in all groups
    def each_item
      @groups.each do |group|
        group["items"].each {|item| yield item }
      end
    end

    # Returns all groups as array
    def to_array
      @groups
    end
  end

end
