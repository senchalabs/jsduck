require "jsduck/tag/tag"

module JsDuck::Tag
  class Cfg < Tag
    def initialize
      @pattern = "cfg"
    end

    # @cfg {Type} [name=default] (required) ...
    def parse(p)
      p.add_tag(:cfg)
      p.maybe_type
      p.maybe_name_with_default
      p.maybe_required
    end
  end
end
