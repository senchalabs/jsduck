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

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#prop-" + id
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b> : #{item[:type]}"
    end

  end

end
