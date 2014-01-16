require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  # Implementation of @new tag.
  class New < JsDuck::MetaTag
    def initialize
      @name = "new"
      @key = :new
      @signature = {:long => "&#9733;", :short => "&#9733;"} # unicode black star char
      @boolean = true
    end

    # Initializes the tooltip text.
    #
    # HACK: This is a special method that's only called for the @new
    # tag. It doesn't fit well into the current meta-tags system.  But
    # until we rework the meta-tags system, this will have to do.
    def create_tooltip!(imports, new_since)
      if new_since
        @signature[:tooltip] = "New since #{new_since}"
      elsif imports.length > 0
        @signature[:tooltip] = "New since #{imports.last[:version]}"
      end
    end

    def to_value(contents)
      true
    end

  end
end

