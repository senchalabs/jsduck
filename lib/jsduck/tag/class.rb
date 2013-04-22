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
    # part from code. So this method gets called by Merger.
    #
    # If we did detect code as a class use all the auto-detected
    # fields, otherwise use only the name field.
    def process_code(h, code)
      if code[:tagname] == :class
        h.merge!(code)
      else
        h[:name] = code[:name]
      end
    end

    # Ensure the empty members array.
    def merge(h, docs, code)
      h[:members] = []
    end
  end
end
