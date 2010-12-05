module JsDuck

  class EventTable < Table
    def initialize(cls)
      super(cls)
      @type = :event
      @id = @cls.full_name + "-events"
      @title = "Public Events"
      @column_title = "Event"
      @row_class = "method-row"
      @short_params = ShortParams.new
    end

    def signature_suffix(item)
      " : " + @short_params.render(item[:params])
    end
  end

end
