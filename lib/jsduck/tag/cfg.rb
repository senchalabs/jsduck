require "jsduck/tag/tag"
require "jsduck/doc/subproperties"

module JsDuck::Tag
  class Cfg < Tag
    def initialize
      @pattern = "cfg"
      @key = :cfg
      @member_type = :cfg
    end

    # @cfg {Type} [name=default] (required) ...
    def parse(p)
      tag = p.standard_tag({:tagname => :cfg, :type => true, :name => true})
      tag[:optional] = false if parse_required(p)
      tag[:doc] = :multiline
      tag
    end

    def parse_required(p)
      p.hw.match(/\(required\)/i)
    end

    def process_doc(h, tags, pos)
      p = tags[0]
      h[:name] = p[:name]
      h[:type] = p[:type]
      h[:default] = p[:default]
      h[:properties] = nest_properties(tags, pos)
      h[:required] = true if p[:optional] == false
    end

    def nest_properties(tags, pos)
      items, warnings = JsDuck::Doc::Subproperties.nest(tags)
      warnings.each {|msg| JsDuck::Logger.warn(:subproperty, msg, pos[:filename], pos[:linenr]) }
      items[0][:properties]
    end
  end
end
