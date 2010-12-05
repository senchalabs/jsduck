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

    def extra_doc(item)
      [
        "<div class='mdetail-params'>",
        "<strong>Parameters:</strong>",
        @long_params.render(item[:params]),
        "<strong>Returns:</strong>",
        render_return(item),
        "</div>"
      ].join("\n")
    end

    def render_return(item)
      type = return_type(item)
      doc = return_doc(item)
      if type == "void" && doc.length == 0
        "<ul><li>void</li></ul>"
      else
        "<ul><li><code>#{type}</code><div class='sub-desc'>#{doc}</div></li></ul>"
      end
    end

    def return_type(item)
      item[:return] ? (item[:return][:type] || "void") : "void"
    end

    def return_doc(item)
      item[:return] ? (item[:return][:doc] || "") : ""
    end
  end

end
