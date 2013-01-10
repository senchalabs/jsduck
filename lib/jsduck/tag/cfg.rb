require "jsduck/tag/tag"

module JsDuck::Tag
  class Cfg < Tag
    def initialize
      @pattern = "cfg"
      @member_type = :cfg
    end

    # @cfg {Type} [name=default] (required) ...
    def parse(p)
      tag = p.standard_tag({:tagname => :cfg})
      tag[:optional] = false if parse_required(p)
      tag
    end

    def parse_required(p)
      p.hw.match(/\(required\)/i)
    end
  end
end
