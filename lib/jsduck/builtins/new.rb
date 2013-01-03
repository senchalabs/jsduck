require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class New < BooleanTag
    def initialize
      @key = :new
      @signature = {:long => "&#9733;", :short => "&#9733;"} # unicode black star char
    end

    # Initializes the tooltip text.
    #
    # FIXME: Copy-pasted code from old Boolean tag class, doesn't
    # currently work as it's never called.
    def create_tooltip!(imports, new_since)
      if new_since
        @signature[:tooltip] = "New since #{new_since}"
      elsif imports.length > 0
        @signature[:tooltip] = "New since #{imports.last[:version]}"
      end
    end

  end
end
