require 'singleton'

module JsDuck

  # Access to meta-tags
  class MetaTagRegistry
    include Singleton

    def initialize
      @tags = []
      @map = {}
    end

    # Adds tags to registry
    def add(tags)
      @tags += tags
      register_keys(tags)
    end

    # Returns list of all available tags
    def tags
      @tags
    end

    # Accesses tag by key or name
    def [](name)
      @map[name]
    end

    # Returns array of attributes to be shown in member signatures
    # (and in order they should be shown in).
    def signatures
      if !@signatures
        @signatures = [
          :static,
          :protected,
          :deprecated,
          :required,
          :template,
          :abstract,
          :readonly,
        ].map do |key|
          s = @map[key].signature
          s[:key] = key
          s
        end
      end
      @signatures
    end

    private

    def register_keys(tags)
      tags.each do |tag|
        @map[tag.key] = tag
        @map[tag.name] = tag
      end
    end
  end

end
