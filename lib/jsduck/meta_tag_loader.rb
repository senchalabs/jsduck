require "jsduck/meta_tag"

module JsDuck

  # Loader for built-in and user-defined meta-tags.
  class MetaTagLoader
    attr_reader :meta_tags

    def initialize
      @classes = []
      @meta_tags = []
    end

    # Loads user-defined meta-tags from given path.
    #
    # * If path is a directory, loads all *.rb files in it.
    # * If path is the symbol :builtins, loads the builtin
    #   tags from ./tag dir.
    # * Otherwise loads tags from the single file.
    def load(path)
      if path == :builtins
        load(File.dirname(__FILE__) + "/tag")
      elsif File.directory?(path)
        # Sort paths, so they are always loaded in the same order.
        # This is important for signatures to always be rendered in
        # the same order.
        Dir[path+"/**/*.rb"].sort.each {|file| load_file(file) }
      else
        load_file(path)
      end
    end

    private

    # Loads just one file.
    def load_file(file)
      require(file)
      init_remaining
    end

    # Instantiates meta tag classes that haven't been instantiated
    # already. This is called after each meta-tags file is loaded so
    # that the list of meta-tags will be in order specified from
    # command line.
    def init_remaining
      MetaTag.descendants.each do |cls|
        if !@classes.include?(cls)
          @classes << cls
          newtag = create_tag(cls)
          @meta_tags = @meta_tags.find_all {|t| t.name != newtag.name }
          @meta_tags << newtag
        end
      end
    end

    # Instanciates tag class.
    # When .key is missing, creates it from .name
    # When .position is missing, defaults to :bottom
    def create_tag(cls)
      tag = cls.new
      tag.key = tag.name.to_sym unless tag.key
      # TIDOC-869. Place description in a custom position
      if tag.key == :description
        tag.position = :custom
      end
      tag.position = :bottom unless tag.position
      tag
    end
  end

end
