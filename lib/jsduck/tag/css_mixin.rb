require "jsduck/tag/tag"

module JsDuck::Tag
  # As of now there is no @css_mixin tag available in CSS files.  This
  # class just exists to define that we have a member type called
  # :css_mixin.
  class CssMixin < Tag
    def initialize
      @member_type = {:name => :css_mixin, :category => :method_like}
    end
  end
end
