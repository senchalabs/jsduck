require "jsduck/tag/tag"

module JsDuck::Tag
  class Class < Tag
    def initialize
      @pattern = "class"
      @tagname = :class
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
    def process_code(code)
      if code[:tagname] == :class
        code
      else
        {:name => code[:name] }
      end
    end

    def merge(h, docs, code)
      # Ensure the empty members array.
      h[:members] = []
      # Ignore extending of the Object class
      h[:extends] = nil if h[:extends] == "Object"
      # Default alternateClassNames list to empty array
      h[:alternateClassNames] = [] unless h[:alternateClassNames]
      # Turn :aliases field into hash
      h[:aliases] = build_aliases_hash(h[:aliases] || [])

      # Takes the :enum always from docs, but the :doc_only can come
      # from either code or docs.
      if docs[:enum]
        h[:enum] = docs[:enum]
        h[:enum][:doc_only] = docs[:enum][:doc_only] || (code[:enum] && code[:enum][:doc_only])
      end
    end

    private

    # Given array of full alias names like "foo.bar", "foo.baz"
    # build hash like {"foo" => ["bar", "baz"]}
    def build_aliases_hash(aliases)
      hash={}
      aliases.each do |a|
        if a =~ /^([^.]+)\.(.+)$/
          if hash[$1]
            hash[$1] << $2
          else
            hash[$1] = [$2]
          end
        end
      end
      hash
    end
  end
end
