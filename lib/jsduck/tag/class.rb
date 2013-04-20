require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
      @tagname = :class
      @merge_context = :class
    end

    # @class name
    def parse_doc(p, pos)
      {
        :tagname => :class,
        :name => p.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name]
    end

    # Although class is not a member, it also has the auto-detected
    # part from code.  So we need this method to say that when we
    # didn't detect code as a class, we only take the name from code.
    def process_code(code)
      {:name => code[:name]}
    end

    # Ensure the empty members array.
    def merge(h, docs, code)
      h[:members] = []
    end
  end
end
