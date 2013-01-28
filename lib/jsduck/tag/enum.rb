require "jsduck/tag/tag"

module JsDuck::Tag
  class Enum < Tag
    def initialize
      @pattern = "enum"
      @key = :enum
      @merge_context = :class
    end

    # @enum {Type} [name=default] ...
    def parse_doc(p)
      enum = p.standard_tag({:tagname => :enum, :type => true, :name => true})

      # @enum is a special case of class, so we also generate a class
      # tag with the same name as given for @enum.
      cls = {:tagname => :class, :name => enum[:name]}

      return [cls, enum]
    end

    def process_doc(h, tags, pos)
      h[:enum] = {
        :type => tags[0][:type],
        :default => tags[0][:default],
        :doc_only => !!tags[0][:default],
      }
    end

    # Takes the :enum always from docs, but the :doc_only can come
    # from either code or docs.
    def merge(h, docs, code)
      return unless docs[:enum]
      h[:enum] = docs[:enum]
      h[:enum][:doc_only] = docs[:enum][:doc_only] || (code[:enum] && code[:enum][:doc_only])
    end

  end
end
