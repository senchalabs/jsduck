require "jsduck/tag/tag"
require "jsduck/util/singleton"

module JsDuck

  # Access to builtin @tags
  class TagRegistry
    include Util::Singleton

    def initialize
      @patterns = {}
      @multiliners = []
      @ext_define_patterns = {}
      @ext_define_defaults = {}
      @keys = {}
      @signatures = []
      @html_renderers = {:top => [], :bottom => []}
      load_tag_classes(File.dirname(__FILE__) + "/tag")
      instantiate_tags
    end

    # Loads tags from given dir.
    def load_tag_classes(dirname)
      Dir[dirname+"/**/*.rb"].each {|file| require(file) }
    end

    # Instantiates all descendants of JsDuck::Tag::Tag
    def instantiate_tags
      tag_classes.each do |cls|
        tag = cls.new()
        Array(tag.pattern).each do |pattern|
          @patterns[pattern] = tag
        end
        if tag.multiline
          @multiliners << tag
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
        if tag.signature
          tag.signature[:key] = tag.key
          @signatures << tag.signature
        end
        if tag.html_position
          @html_renderers[tag.html_position] << tag
        end
      end
    end

    # Returns all available Tag classes sorted alphabetically.  This
    # ensures attributes in member signatures are always rendered in
    # the same order.
    def tag_classes
      JsDuck::Tag::Tag.descendants.sort {|a, b| a.to_s <=> b.to_s }
    end

    #
    # Accessors for lists of tags
    #

    # Returns all multiline tags.
    attr_reader :multiliners

    # Default values for class config when Ext.define is encountered.
    attr_reader :ext_define_defaults

    # Array of attributes to be shown in member signatures
    # (and in order they should be shown in).
    attr_reader :signatures

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
