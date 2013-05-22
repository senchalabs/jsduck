require "jsduck/tag/member_tag"
require "jsduck/render/method_signature"

module JsDuck::Tag
  # As of now there is no @css_mixin tag available in CSS files.  This
  # class just exists to define that we have a member type called
  # :css_mixin.
  class CssMixin < MemberTag
    def initialize
      @tagname = :css_mixin
      @member_type = {
        :title => "CSS Mixins",
        :position => MEMBER_POS_CSS_MIXIN,
      }
    end

    def to_html(mixin, cls)
      JsDuck::Render::MethodSignature.render(mixin, cls)
    end
  end
end
