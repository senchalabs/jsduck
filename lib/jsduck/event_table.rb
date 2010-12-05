module JsDuck

  class EventTable < Table
    def initialize(cls)
      super(cls)
      @type = :event
      @id = @cls.full_name + "-events"
      @title = "Public Events"
      @column_title = "Event"
      @row_class = "method-row"
      @param_list = ParamList.new
    end

    def signature_suffix(item)
      " : " + @param_list.short(item[:params])
    end
  end

end
