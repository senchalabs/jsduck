require 'singleton'
require "jsduck/meta_tag_loader"

module JsDuck

  # Access to meta-tags
  class MetaTagRegistry
    include Singleton

    def initialize
      @tags = []
      @map = {}
    end

    # Loads meta-tags from the given paths.  See MetaTagLoader#load
    # for details.
    #
    # This should only be called once. Calling it twice will override
    # the previously loaded tags.
    def load(paths)
      loader = MetaTagLoader.new
      paths.each {|p| loader.load(p) }
      register(loader.meta_tags)
    end

    # Registers MetaTag instances.
    #
    # NB! This is for testing purposes only, elsewhere always use #load.
    def register(tags)
      @tags = tags
      register_keys
    end

    # Returns array of all available tag instances
    def tags
      @tags
    end

    # Accesses tag by key or name
    def [](name)
      @map[name]
    end

    # Returns the formatter assigned to tags
    def formatter
      @formatter
    end

    # Sets the doc-formatter for all tags
    def formatter=(doc_formatter)
      @formatter = doc_formatter
      @tags.each {|tag| tag.formatter = doc_formatter }
    end

    # Gives access to assets for all tags
    def assets=(assets)
      @tags.each {|tag| tag.assets = assets }
    end

    # Returns array of attributes to be shown in member signatures
    # (and in order they should be shown in).
    def signatures
      if !@signatures
        @signatures = @tags.find_all(&:signature).map do |tag|
          s = tag.signature
          s[:key] = tag.key
          s
        end
      end
      @signatures
    end

    private

    def register_keys
      @map = {}
      @tags.each do |tag|
        @map[tag.key] = tag
        @map[tag.name] = tag
      end
    end
  end

end
