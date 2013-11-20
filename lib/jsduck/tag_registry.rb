require "jsduck/tag_loader"

module JsDuck

  # Access to builtin @tags
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
      @html_renderers = []
      @html_renderers_sorted = false
      @member_types = []
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

        if tag.respond_to?(:member_type) && tag.member_type
          tag.member_type[:name] = tag.tagname
          @member_types << tag.member_type
        end

        if tag.signature
          tag.signature[:tagname] = tag.tagname
          @signatures << tag.signature
        end

        if tag.html_position
          @html_renderers << tag
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

    # Same as #member_types, but returns just the names of member types.
    def member_type_names
      member_types.map {|mt| mt[:name] }
    end

    # Returns array of available member types.
    # Sorted in the order defined by :position.
    def member_types
      if !@member_types_sorted
        @member_types.sort! {|a, b| a[:position] <=> b[:position] }
        @member_types_sorted = true
      end

      @member_types
    end

    # Regex for matching member type name in member reference.
    #
    # The regex matches strings like: "method-" or "event-".  It
    # contains a capture group to capture the actual name of the
    # member, leaving out the dash "-".
    def member_type_regex
      @member_type_regex if @member_type_regex
      @member_type_regex = Regexp.new("(?:(" + member_type_names.join("|") + ")-)")
    end

    # Returns tags for rendering HTML, sorted in the order they should
    # appear in final output. Sorting order is determined by the
    # numeric :html_position field.
    def html_renderers
      if !@html_renderers_sorted
        @html_renderers.sort! {|a, b| a.html_position <=> b.html_position }
        @html_renderers_sorted = true
      end

      @html_renderers
    end

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
