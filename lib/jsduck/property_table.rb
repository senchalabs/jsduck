module JsDuck

  class PropertyTable < Table
    def initialize(cls)
      super(cls)
      @type = :property
      @id = @cls.full_name + "-props"
      @title = "Public Properties"
      @column_title = "Property"
      @row_class = "property-row"
    end

    def signature_suffix(item)
      " : " + (item[:type] || "Object")
    end

  end

end
