module JsDuck

  class MethodTable < Table
    def initialize(cls)
      super(cls)
      @type = :method
      @id = @cls.full_name + "-methods"
      @title = "Public Methods"
      @column_title = "Method"
      @row_class = "method-row"
    end

    def signature_suffix(item)
      short_param_list(item) + " : " + (item[:return] ? (item[:return][:type] || "void") : "void")
    end
  end

end
