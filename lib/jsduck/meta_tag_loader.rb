require "jsduck/meta_tag"
require 'jsduck/tag/author'
require 'jsduck/tag/docauthor'
require 'jsduck/tag/static'
require 'jsduck/tag/protected'
require 'jsduck/tag/deprecated'
require 'jsduck/tag/required'
require 'jsduck/tag/template'
require 'jsduck/tag/abstract'
require 'jsduck/tag/readonly'

module JsDuck

  # Loads user-defined meta-tags
  class MetaTagLoader
    attr_reader :meta_tags

    # instatiates builtin meta tags
    def initialize
      @classes = MetaTag.descendants
      @meta_tags = @classes.map {|cls| cls.new }
    end

    # Loads user-defined meta-tags from given paths.
    # Returns list of meta-tag instances.
    def load(paths)
      paths.each do |path|
        if File.directory?(path)
          Dir[path+"/**/*.rb"].each do |file|
            require(file)
            init_remaining
          end
        else
          require(path)
          init_remaining
        end
      end
      @meta_tags
    end

    # Instantiates meta tag classes that haven't been instantiated
    # already. This is called after each meta-tags file is loaded so
    # that the list of meta-tags will be in order specified from
    # command line.
    def init_remaining
      MetaTag.descendants.each do |cls|
        if !@classes.include?(cls)
          @classes << cls
          newtag = cls.new
          @meta_tags = @meta_tags.find_all {|t| t.name != newtag.name }
          @meta_tags << newtag
        end
      end
    end
  end

end
