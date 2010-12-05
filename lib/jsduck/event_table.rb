module JsDuck

  class EventTable < Table
    def initialize(cls)
      super(cls)
      @type = :event
      @id = @cls.full_name + "-events"
      @title = "Public Events"
      @column_title = "Event"
      @row_class = "method-row"
    end

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#event-" + id
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b> : ()"
    end

  end

end
