require "jsduck/tag/tag"

module JsDuck::Tag
  class Return < Tag
    def initialize
      @pattern = ["return", "returns"]
    end

    # @return {Type} return.name ...
    def parse(p)
      tag = p.standard_tag({:tagname => :return, :type => true})
      tag[:name] = subproperty_name(p)
      tag
    end

    def subproperty_name(p)
      if p.hw.look(/return\.\w/)
        p.ident_chain
      else
        "return"
      end
    end
  end
end
