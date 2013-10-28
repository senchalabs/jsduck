require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class New < BooleanTag
    def initialize
      @pattern = "new"
      # A :tooltip field gets injected to this signature in Process::Versions
      @signature = {:long => "&#9733;", :short => "&#9733;"}
      # black (docs text color) unicode star on yellow background
      @css = <<-EOCSS
        .signature .new {
          color: #484848;
          background-color: #F5D833;
        }
      EOCSS
      super
    end

    # Initializes the tooltip text based on the --new-since and
    # --import options passed from command line.
    #
    # NOTE: This method is explicitly called from JsDuck::Options class.
    def init_tooltip!(opts)
      if opts[:new_since]
        @signature[:tooltip] = "New since #{opts[:new_since]}"
      elsif opts[:imports].length > 0
        @signature[:tooltip] = "New since #{opts[:imports].last[:version]}"
      end
    end

  end
end
