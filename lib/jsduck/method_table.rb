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

    def short_param_list(item)
      params = item[:params].collect do |p|
        (p[:type] || "Object") + " " + (p[:name] || "")
      end
      return params.length > 0 ? ("( " + params.join(", ") + " )") : "()"
    end

  end

end
