require "jsduck/builtins/tag"
require "jsduck/util/singleton"

module JsDuck

  # Access to builtin @tags
  class BuiltinsRegistry
    include Util::Singleton

    def initialize
      @map = {}
      load_tag_classes(File.dirname(__FILE__) + "/builtins")
      instantiate_tags
    end

    # Loads tags from given dir.
    def load_tag_classes(dirname)
      Dir[dirname+"/**/*.rb"].sort.each {|file| require(file) }
    end

    # Instantiates all descendants of JsDuck::Builtins::Tag
    def instantiate_tags
      JsDuck::Builtins::Tag.descendants.each do |cls|
        tag = cls.new()
        Array(tag.pattern).each do |pattern|
          @map[pattern] = tag
        end
      end
    end

    # Accesses tag by @name pattern
    def [](name)
      @map[name]
    end

  end

end
