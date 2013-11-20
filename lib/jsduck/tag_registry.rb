require "jsduck/tag_loader"

module JsDuck

  # Access to all @tag definitions.
  class TagRegistry
    # Access to the singleton instance (only used internally)
    def self.instance
      @instance = TagRegistry.new unless @instance
      @instance
    end

    # Reconfigures the registry with additional load paths.
    # Used in Options class.
    def self.reconfigure(load_paths)
      @instance = TagRegistry.new(load_paths)
    end

    # Redirect calls from TagRegistry.method to TagRegistry.instance.method,
    # making it behave like other Singleton classes.
    def self.method_missing(meth, *args, &block)
      self.instance.send(meth, *args, &block)
    end

    def initialize(load_paths=[])
      @patterns = {}
      @tagnames = {}
      @signatures = []
      @tags = []

      instantiate_tags(TagLoader.new(load_paths).load_all)
    end

    # Instantiates all descendants of JsDuck::Tag::Tag
    def instantiate_tags(tag_classes)
      tag_classes.each do |cls|
        tag = cls.new()

        Array(tag.pattern).each do |pattern|
          @patterns[pattern] = tag
        end

        if tag.tagname
          @tagnames[tag.tagname] = tag
        end

        if tag.signature
          tag.signature[:tagname] = tag.tagname
          @signatures << tag.signature
        end

        @tags << tag
      end
    end

    #
    # Accessors for lists of tags
    #

    # Array of attributes to be shown in member signatures
    # (and in order they should be shown in).
    attr_reader :signatures

    # Array of all available tags
    attr_reader :tags

    #
    # Accessors for a single tag
    #

    # Accesses tag by @name pattern
    def get_by_pattern(name)
      @patterns[name]
    end

    # Accesses tag by name - the symbol under which the tag data
    # is stored in final hash.
    def get_by_name(name)
      @tagnames[name]
    end

  end

end
