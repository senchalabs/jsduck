require "jsduck/tag/tag"

module JsDuck::Tag
  # Implementation of @method tag.
  class Method < Tag
    def initialize
      @pattern = "method"
      @member_type = :method
    end

    # @method name ...
    def parse(p)
      {
        :tagname => :method,
        :name => p.hw && p.ident,
      }
    end
  end
end
