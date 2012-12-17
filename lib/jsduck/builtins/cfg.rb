module JsDuck::Builtins
  # Implementation of @cfg tag.
  class Cfg
    def initialize
      @pattern = "cfg"
    end

    def parse(p)
      p.add_tag(:cfg)
      p.maybe_type
      p.maybe_name_with_default
      maybe_required(p)
    end

    # matches: "(required)"
    def maybe_required(p)
      p.skip_horiz_white
      if p.look(/\(required\)/i)
        p.match(/\(required\)/i)
        p.current_tag[:optional] = false
      end
    end
  end
end
