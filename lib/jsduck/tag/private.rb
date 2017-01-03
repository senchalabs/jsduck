require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @private tag.
  #
  # Marks class/member as private.
  #
  # Because :private is accessed a lot internally, it's also injected
  # to the main hash of documentation item.
  #
  class Private < JsDuck::MetaTag
    def initialize
      @name = "private"
      @key = :private
      @boolean = true
      @signature = {:long => "private", :short => "PRI"}
    end
  end
end

