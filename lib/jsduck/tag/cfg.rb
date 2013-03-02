require "jsduck/tag/tag"
require "jsduck/doc/subproperties"

module JsDuck::Tag
  class Cfg < Tag
    def initialize
      @pattern = "cfg"
      @tagname = :cfg
      @repeatable = true
      @member_type = {
        :name => :cfg,
        :category => :property_like,
        :title => "Config options",
        :toolbar_title => "Configs",
        :position => MEMBER_POS_CFG,
        :subsections => [
          {:title => "Required config options", :filter => {:required => true}},
          {:title => "Optional config options", :filter => {:required => false}, :default => true},
        ]
      }
    end

    # @cfg {Type} [name=default] (required) ...
    def parse_doc(p, pos)
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
      h[:properties] = JsDuck::Doc::Subproperties.nest(tags, pos)[0][:properties]
      h[:required] = true if p[:optional] == false
      # Documentation after the first @cfg is part of the top-level docs.
      h[:doc] += p[:doc]
    end
  end
end
