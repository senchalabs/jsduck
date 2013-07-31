require "jsduck/tag/member_tag"
require "jsduck/doc/subproperties"

module JsDuck::Tag
  class Property < MemberTag
    def initialize
      @pattern = "property"
      @tagname = :property
      @repeatable = true
      @member_type = {
        :title => "Properties",
        :position => MEMBER_POS_PROPERTY,
        :icon => File.dirname(__FILE__) + "/icons/property.png",
        :subsections => [
          {:title => "Instance properties", :filter => {:static => false}, :default => true},
          {:title => "Static properties", :filter => {:static => true}},
        ]
      }
    end

    # @property {Type} [name=default] ...
    def parse_doc(p, pos)
      tag = p.standard_tag({
          :tagname => :property,
          :type => true,
          :name => true,
          :default => true,
          :optional => true
        })
      tag[:doc] = :multiline
      tag
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      # Type might also come from @type, don't overwrite it with nil.
      h[:type] = p[:type] if p[:type]
      h[:default] = p[:default]

      # Documentation after the first @property is part of the top-level docs.
      h[:doc] += p[:doc]

      nested = JsDuck::Doc::Subproperties.nest(tags, pos)[0]
      h[:properties] = nested[:properties]
      h[:name] = nested[:name]
    end

    def process_code(code)
      h = super(code)
      h[:type] = code[:type]
      h[:default] = code[:default]
      h[:readonly] = code[:readonly]
      h
    end

    # Do the merging of :type field
    def merge(h, docs, code)
      if h[:type] == nil
        h[:type] = code[:tagname] == :method ? "Function" : "Object"
      end
    end

    def to_html(property, cls)
      member_link(property) + " : " + property[:html_type]
    end
  end
end
