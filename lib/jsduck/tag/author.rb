require "jsduck/tag/tag"

module JsDuck::Tag
  # Author tag gets processed, but no output gets created.  Users of
  # JSDuck may override this tag to make it print the names of
  # authors.
  class Author < Tag
    def initialize
      @pattern = "author"
      @tagname = :author
    end

    # @author Name of Author <email@example.com> ...
    def parse_doc(p)
      name = p.match(/[^<\n]*/).strip
      if p.look(/</)
        p.match(/</)
        email = p.match(/[^>\n]*/)
        p.match(/>/)
      end

      return {:tagname => @tagname, :name => name, :email => email}
    end

    def process_doc(context, tags, pos)
      context[@tagname] = tags
    end
  end
end
