require "jsduck/tag/tag"

module JsDuck::Tag
  class Enum < Tag
    def initialize
      @pattern = "enum"
      @tagname = :enum
      @merge_context = :class
      @html_position = POS_ENUM
      # Green box
      @css = <<-EOCSS
        .enum-box {
          color: #060;
          background-color: #efe;
          text-align: center;
        }
      EOCSS
    end

    # @enum {Type} [name=default] ...
    def parse_doc(p, pos)
      enum = p.standard_tag({
          :tagname => :enum,
          :type => true,
          :name => true,
          :default => true,
          :optional => true
        })

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

    def to_html(cls)
      if cls[:enum][:doc_only]
        first = cls[:members][0] || {:name => 'foo', :default => '"foo"'}
        [
          "<div class='rounded-box enum-box'>",
          "<p><strong>ENUM:</strong> ",
          "This enumeration defines a set of String values. ",
          "It exists primarily for documentation purposes - ",
          "in code use the actual string values like #{first[:default]}, ",
          "don't reference them through this class like #{cls[:name]}.#{first[:name]}.</p>",
          "</div>",
        ]
      else
        [
          "<div class='rounded-box enum-box'>",
          "<p><strong>ENUM:</strong> ",
          "This enumeration defines a set of #{cls[:enum][:type]} values.</p>",
          "</div>",
        ]
      end
    end

  end
end
