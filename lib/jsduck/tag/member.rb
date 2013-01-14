require "jsduck/tag/tag"

module JsDuck::Tag
  class Member < Tag
    # This is an odd case where tag itself is @member, but the value
    # of it gets stored in :owner.
    def initialize
      @pattern = "member"
      @key = :owner
    end

    # @member classname
    def parse(p)
      {
        :tagname => :owner,
        :owner => p.hw.ident_chain,
      }
    end

    def process_doc(tags)
      {:owner => tags[0][:owner]}
    end
  end
end
