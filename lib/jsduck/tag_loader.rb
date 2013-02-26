require "jsduck/tag/tag"

module JsDuck

  # Loads Tag classes from the builtin tags/ dir and optionally also
  # from additional paths.
  class TagLoader
    def initialize(extra_paths=[])
      @paths = [File.dirname(__FILE__) + "/tag"]
      @paths += extra_paths
    end

    # Loads Tag classes from all supplied paths.
    #
    # Returns the tag classes that got loaded, sorted alphabetically
    # by class name.
    def load_all
      @paths.each {|path| load(path) }
      tag_classes
    end

    private

    # Loads tag classes from given dir or single file.
    def load(path)
      if File.directory?(path)
        Dir[path+"/**/*.rb"].each {|file| require(file) }
      else
        require(path)
      end
    end

    def tag_classes
      classes = JsDuck::Tag::Tag.descendants
      # sort by classname
      # This ensures attributes in member signatures are
      # always rendered in the same order.
      classes.sort {|a, b| a.name <=> b.name }
    end

  end

end
