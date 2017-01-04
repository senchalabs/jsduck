require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @protected tag
  class Protected < JsDuck::MetaTag
    def initialize
      @name = "protected"
      @key = :protected
      @signature = {:long => "protected", :short => "PRO"}
      @boolean = true
    end
  end
end

