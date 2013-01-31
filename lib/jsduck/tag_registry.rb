require "jsduck/tag_loader"
require "jsduck/util/singleton"

module JsDuck

  # Access to builtin @tags
  class TagRegistry
    include Util::Singleton

    def initialize
      @patterns = {}
      @ext_define_patterns = {}
      @ext_define_defaults = {}
      @keys = {}
      @mergers = {}
      @signatures = []
      @html_renderers = []
      @html_renderers_sorted = false
      @member_types = []

      @loader = TagLoader.new
      load_from(File.dirname(__FILE__) + "/tag")
    end

    # Loads and instantiates tags from the given file or dir.
    def load_from(path)
      instantiate_tags(@loader.load_from(path))
    end

    # Instantiates all descendants of JsDuck::Tag::Tag
    def instantiate_tags(tag_classes)
      tag_classes.each do |cls|
        tag = cls.new()

        Array(tag.pattern).each do |pattern|
          @patterns[pattern] = tag
        end

        Array(tag.ext_define_pattern).each do |pattern|
          @ext_define_patterns[pattern] = tag
        end

        if tag.ext_define_default
          @ext_define_defaults.merge!(tag.ext_define_default)
        end

        if tag.key
          @keys[tag.key] = tag
        end

        Array(tag.merge_context).each do |context|
          @mergers[context] = [] unless @mergers[context]
          @mergers[context] << tag
        end

        if tag.member_type
          @member_types << tag.member_type
        end

        if tag.signature
          tag.signature[:key] = tag.key
          @signatures << tag.signature
        end

        if tag.html_position
          @html_renderers << tag
        end
      end
    end

    #
    # Accessors for lists of tags
    #

    # Default values for class config when Ext.define is encountered.
    attr_reader :ext_define_defaults

    # Array of attributes to be shown in member signatures
    # (and in order they should be shown in).
    attr_reader :signatures

    # Same as #member_types, but returns just the names of member types.
    def member_type_names(category=:member)
      member_types(category).map {|mt| mt[:name] }
    end

    # Returns array of available member types.
    # Sorted in the order defined by :position.
    #
    # An optional category argument can be given to limit the returned
    # members to just :method_like or :property_like.
    def member_types(category=:member)
      if !@member_types_sorted
        @member_types.sort! {|a, b| a[:position] <=> b[:position] }
        @member_types_sorted = true
      end

      if category == :member
        @member_types
      else
        @member_types.find_all {|mt| mt[:category] == category }
      end
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

    # Returns tags for doing the merging in a particular context.
    # See Tag::Tag#merge_context for details.
    def mergers(context)
      expand_merge_contexts unless @mergers_expanded

      @mergers[context] || []
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

    # Accesses tag by Ext.define pattern
    def get_by_ext_define_pattern(name)
      @ext_define_patterns[name]
    end

    # Accesses tag by key name - the symbol under which the tag data
    # is stored in final hash.
    def get_by_key(key)
      @keys[key]
    end

    private

    # Takes mergers registered under :member, :method_like or
    # :property_like context and adds them to the contexts all of the
    # detected suitable member types.
    def expand_merge_contexts
      expand_merger(:member)
      expand_merger(:method_like)
      expand_merger(:property_like)
      @mergers_expanded
    end

    def expand_merger(type_name)
      Array(@mergers[type_name]).each do |tag|
        member_type_names(type_name).each do |tagname|
          @mergers[tagname] = [] unless @mergers[tagname]
          @mergers[tagname] << tag
        end
      end
      @mergers.delete(type_name)
    end

  end

end
