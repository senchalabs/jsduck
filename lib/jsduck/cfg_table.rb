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

    def signature_suffix(item)
      " : " + item[:type]
    end

  end

end
