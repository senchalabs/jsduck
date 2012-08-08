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
    #
    # Prints warning when there is a duplicate item within a group.
    # The warning message should say something like "duplicate <asset type>"
    def build_map_by_name(warning_msg)
      @map_by_name = {}
      @groups.each do |group|
        group_map = {}
        group["items"].each do |item|
          # Ti has some ungrouped guides (for example, the Quick Start)
          if group_map[item["name"]]
            Logger.instance.warn(:dup_asset, "#{warning_msg} '#{item['name']}'")
          end
          @map_by_name[item["name"]] = item
          group_map[item["name"]] = item
        end
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
