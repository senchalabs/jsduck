module JsDuck

  # Takes output of JsLiteralParser and converts it to string
  class JsLiteralBuilder

    # Converts literal object definition to string
    def to_s(lit)
      if lit[:type] == :string
        '"' + lit[:value] + '"'
      elsif lit[:type] == :array
        "[" + lit[:value].map {|v| to_s(v) }.join(", ") + "]"
      elsif lit[:type] == :object
        "{" + lit[:value].map {|v| to_s(v[:key]) + ": " + to_s(v[:value]) }.join(", ") + "}"
      else
        lit[:value]
      end
    end

  end

end
