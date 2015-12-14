require "jsduck/tag/member_tag"

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
        :icon => File.dirname(__FILE__) + "/icons/css_mixin.png"
      }
    end

    def process_code(code)
      h = super(code)
      h[:params] = code[:params]
      h
    end

    def merge(h, docs, code)
      JsDuck::ParamsMerger.merge(h, docs, code)
    end

    def to_html(mixin, cls)
      member_link(mixin) + member_params(mixin[:params])
    end
  end
end
