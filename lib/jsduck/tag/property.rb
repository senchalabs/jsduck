require "jsduck/tag/tag"

module JsDuck::Tag
  class Property < Tag
    def initialize
      @pattern = "property"
      @member_type = :property
    end

    # @property {Type} [name=default] ...
    def parse(p)
      p.standard_tag({:tagname => :property, :type => true, :name => true})
    end
  end
end
