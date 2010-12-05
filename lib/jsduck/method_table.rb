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

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#method-" + id
      type = item[:return] ? (item[:return][:type] || "void") : "void"
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b>() : #{type}"
    end

  end

end
