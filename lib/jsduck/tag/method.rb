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
      p.add_tag(:method)
      p.maybe_name
    end
  end
end
