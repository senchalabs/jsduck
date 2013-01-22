require "jsduck/tag/tag"
require "jsduck/doc/subproperties"

module JsDuck::Tag
  class Property < Tag
    def initialize
      @pattern = "property"
      @key = :property
      @member_type = :property
    end

    # @property {Type} [name=default] ...
    def parse(p)
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
      h[:properties] = nest_properties(tags, pos)
    end

    def nest_properties(tags, pos)
      items, warnings = JsDuck::Doc::Subproperties.nest(tags)
      warnings.each {|msg| JsDuck::Logger.warn(:subproperty, msg, pos[:filename], pos[:linenr]) }
      items[0][:properties]
    end
  end
end
