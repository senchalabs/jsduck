require "jsduck/tag/tag"
require "jsduck/render/method_signature"

module JsDuck::Tag
  # As of now there is no @css_mixin tag available in CSS files.  This
  # class just exists to define that we have a member type called
  # :css_mixin.
  class CssMixin < Tag
    def initialize
      @member_type = {
        :name => :css_mixin,
        :category => :method_like,
        :title => "CSS Mixins",
        :position => MEMBER_POS_CSS_MIXIN,
      }
    end

    def to_html(mixin, cls)
      JsDuck::Render::MethodSignature.render(mixin, cls)
    end
  end
end
