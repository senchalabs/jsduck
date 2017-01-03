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
    def build_map_by_name
      @map_by_name = {}
      @groups.each do |group|
        group_map = {}
        group["items"].each do |item|
          # Ti has some ungrouped guides (for example, the Quick Start)
          if group_map[item["name"]]
            Logger.instance.warn(:dup_asset, "#{warning_msg} '#{item['name']}'", filename)
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
    def each_item(group=nil, &block)
      group = group || @groups

      group.each do |item|
        if item["items"]
          each_item(item["items"], &block)
        else
          block.call(item)
        end
      end
    end

    def map_items(group=nil, &block)
      group = group || @groups

      group.map do |item|
        if item["items"]
          {
            "title" => item["title"],
            "items" => map_items(item["items"], &block)
          }
        else
          block.call(item)
        end
      end
    end

    # Returns all groups as array
    def to_array
      @groups
    end
  end

end
