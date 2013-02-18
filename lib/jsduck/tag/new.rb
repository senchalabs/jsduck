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
  end
end
