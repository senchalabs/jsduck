require "jsduck/tag/tag"

module JsDuck::Tag
  class Member < Tag
    # This is an odd case where tag itself is @member, but the value
    # of it gets stored in :owner.
    def initialize
      @pattern = "member"
      @tagname = :owner
    end

    # @member classname
    def parse_doc(p)
      {
        :tagname => :owner,
        :owner => p.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:owner] = tags[0][:owner]
    end
  end
end
