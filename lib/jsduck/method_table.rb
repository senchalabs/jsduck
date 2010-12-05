module JsDuck

  class MethodTable < Table
    def initialize(cls)
      super(cls)
      @type = :method
      @id = @cls.full_name + "-methods"
      @title = "Public Methods"
      @column_title = "Method"
      @row_class = "method-row"
      @short_params = ShortParams.new
      @long_params = LongParams.new(@cls)
    end

    def signature_suffix(item)
      @short_params.render(item[:params]) + " : " + return_type(item)
    end

    def return_type(item)
      item[:return] ? (item[:return][:type] || "void") : "void"
    end

    def extra_doc(item)
      [
        "<div class='mdetail-params'>",
        "<strong>Parameters:</strong>",
        @long_params.render(item[:params]),
        "</div>"
      ].join("\n")
    end
  end

end
