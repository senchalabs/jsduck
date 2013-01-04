require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class New < BooleanTag
    def initialize
      @key = :new
      @signature = {:long => "&#9733;", :short => "&#9733;"} # unicode black star char
    end

    # Initializes the tooltip text.
    #
    # Gets passed the options object containing command line parameters.
    #
    # FIXME: This method is exclusively called only for this New tag
    # class.  Figure out some way to generalize this.
    def options=(opts)
      if opts.new_since
        @signature[:tooltip] = "New since #{opts.new_since}"
      elsif opts.imports.length > 0
        @signature[:tooltip] = "New since #{opts.imports.last[:version]}"
      end
    end

  end
end
