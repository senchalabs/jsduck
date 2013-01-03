require "jsduck/tag/tag"

module JsDuck::Tag
  class Member < Tag
    def initialize
      @pattern = "member"
    end

    # @member classname
    def parse(p)
      p.add_tag(:member)
      p.maybe_ident_chain(:member)
    end
  end
end
