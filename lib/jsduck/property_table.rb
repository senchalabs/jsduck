require 'jsduck/table'

module JsDuck

  class PropertyTable < Table
    def initialize(cls, cache={})
      super(cls, cache)
      @type = :property
      @id = @cls.full_name + "-props"
      @title = "Public Properties"
      @column_title = "Property"
      @row_class = "property-row"
    end

    def signature_suffix(item)
      " : " + item[:type]
    end

  end

end
