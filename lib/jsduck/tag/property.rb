require "jsduck/tag/tag"

module JsDuck::Tag
  class Property < Tag
    def initialize
      @pattern = "property"
      @member_type = :property
    end

    # @property {Type} [name=default] ...
    def parse(p)
      tag = p.standard_tag({:tagname => :property, :type => true, :name => true})
      tag[:doc] = :multiline
      tag
    end
  end
end
