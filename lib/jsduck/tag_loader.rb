require "jsduck/tag/tag"

module JsDuck

  class TagLoader
    def initialize
      @already_loaded = {}
    end

    # Loads tag classes from given dir or single file.
    #
    # Returns the tag classes that got loaded, sorted alphabetically
    # by class name. This ensures attributes in member signatures are
    # always rendered in the same order.
    def load_from(path)
      if File.directory?(path)
        Dir[path+"/**/*.rb"].each {|file| require(file) }
      else
        require(path)
      end

      tag_classes
    end

    private

    def tag_classes
      classes = JsDuck::Tag::Tag.descendants
      # exclude already loaded classes
      classes.reject! {|cls| @already_loaded[cls.name] }
      # remember these classes as loaded
      classes.each {|cls| @already_loaded[cls.name] = true }
      # sort by classname
      classes.sort {|a, b| a.name <=> b.name }
    end

  end

end
