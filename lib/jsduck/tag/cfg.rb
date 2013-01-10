require "jsduck/tag/tag"

module JsDuck::Tag
  class Cfg < Tag
    def initialize
      @pattern = "cfg"
      @member_type = :cfg
    end

    # @cfg {Type} [name=default] (required) ...
    def parse(p)
      p.add_tag(:cfg)
      p.maybe_type
      p.maybe_name_with_default
      p.current_tag[:optional] = false if parse_required(p)
    end

    def parse_required(p)
      p.hw.match(/\(required\)/i)
    end
  end
end
