module JsDuck

  class CfgTable < Table
    def initialize(cls)
      super(cls)
      @type = :cfg
      @id = @cls.full_name + "-configs"
      @title = "Config Options"
      @column_title = "Config Options"
      @row_class = "config-row"
    end

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#cfg-" + id
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b> : #{item[:type]}"
    end

  end

end
