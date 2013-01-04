require "jsduck/tag/tag"

module JsDuck

  class TagLoader
    # Loads builtin tags from /tag dir.
    # Returns array of Tag classes.
    def load_builtins
      load_tag_classes(File.dirname(__FILE__) + "/tag")
      tag_classes
    end

    private

    # Loads tags from given dir.
    def load_tag_classes(dirname)
      Dir[dirname+"/**/*.rb"].each {|file| require(file) }
    end

    # Returns all available Tag classes sorted alphabetically.  This
    # ensures attributes in member signatures are always rendered in
    # the same order.
    def tag_classes
      JsDuck::Tag::Tag.descendants.sort {|a, b| a.to_s <=> b.to_s }
    end

  end

end
