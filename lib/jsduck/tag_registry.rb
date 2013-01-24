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
      @signatures = []
      @html_renderers = {:top => [], :bottom => []}
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
        if tag.member_type
          @member_types << tag.member_type
        end
        if tag.signature
          tag.signature[:key] = tag.key
          @signatures << tag.signature
        end
        if tag.html_position
          @html_renderers[tag.html_position] << tag
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

    # Array of available member types.
    attr_reader :member_types

    # Regex for matching member type name in member reference.
    #
    # The regex matches strings like: "method-" or "event-".  It
    # contains a capture group to capture the actual name of the
    # member, leaving out the dash "-".
    def member_type_regex
      @member_type_regex if @member_type_regex
      @member_type_regex = Regexp.new("(?:(" + TagRegistry.member_types.join("|") + ")-)")
    end

    # Returns tags for rendering HTML.  One can ask for tags for
    # rendering either :top or :bottom section.  By default renderers
    # for both sections are returned.
    def html_renderers(position = :all)
      if position == :all
        @html_renderers[:top] + @html_renderers[:bottom]
      else
        @html_renderers[position]
      end
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

    # Gives access to assets from @aside tag
    def assets=(assets)
      @keys[:aside].assets = assets
    end
  end

end
