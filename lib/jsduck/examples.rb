require 'jsduck/util/json'
require 'jsduck/util/null_object'
require 'jsduck/grouped_asset'

module JsDuck

  # Reads in examples JSON file
  class Examples < GroupedAsset
    # Creates Examples object from filename.
    def self.create(filename, opts)
      if filename
        Examples.new(filename, opts)
      else
        Util::NullObject.new(:to_array => [], :[] => nil)
      end
    end

    # Parses examples config file
    def initialize(filename, opts)
      @groups = Util::Json.read(filename)
      @opts = opts
      fix_examples_data
      build_map_by_name
    end

    # Prefix all relative URL-s in examples list with path given in --examples-base-url
    #
    # For backwards compatibility:
    #
    # - Create names for each example when not present
    # - Create title from text
    # - Create description from desc
    #
    def fix_examples_data
      each_item do |ex|
        ex["name"] = ex["url"] unless ex["name"]

        unless ex["url"] =~ /^https?:\/\//
          ex["url"] = @opts.examples_base_url + ex["url"]
        end
        unless ex["icon"] =~ /^https?:\/\//
          ex["icon"] = @opts.examples_base_url + ex["icon"]
        end

        unless ex["title"]
          ex["title"] = ex["text"]
          ex.delete("text")
        end
        unless ex["description"]
          ex["description"] = ex["desc"]
          ex.delete("desc")
        end
      end
    end

    # Extracts example icon URL from example hash
    def icon_url(example)
      example["icon"]
    end

  end

end
