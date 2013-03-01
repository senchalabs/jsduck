require "jsduck/tag/tag"
require "jsduck/doc/subproperties"

module JsDuck::Tag
  class Property < Tag
    def initialize
      @pattern = "property"
      @tagname = :property
      @member_type = {
        :name => :property,
        :category => :property_like,
        :title => "Properties",
        :position => MEMBER_POS_PROPERTY,
        :subsections => [
          {:title => "Instance properties", :filter => {:static => false}, :default => true},
          {:title => "Static properties", :filter => {:static => true}},
        ]
      }
    end

    # @property {Type} [name=default] ...
    def parse_doc(p, pos)
      tag = p.standard_tag({:tagname => :property, :type => true, :name => true})
      tag[:doc] = :multiline
      tag
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      h[:name] = p[:name]
      # Type might also come from @type, don't overwrite it with nil.
      h[:type] = p[:type] if p[:type]
      h[:default] = p[:default]
      h[:properties] = JsDuck::Doc::Subproperties.nest(tags, pos)[0][:properties]
      # Documentation after the first @property is part of the top-level docs.
      h[:doc] += p[:doc]
    end
  end
end
