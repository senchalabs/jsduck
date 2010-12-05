module JsDuck

  # Renders method/event parameter lists
  class ParamList
    # Creates short parameters list used in signatures.
    def short(params)
      if params.length > 0
        "( " + params.collect {|p| format_short(p) }.join(", ") + " )"
      else
        "()"
      end
    end

    def format_short(param)
      type = param[:type] || "Object"
      name = param[:name] || ""
      str = "<code>#{type} #{name}</code>"
      if optional?(param)
        "<span title='Optional' class='optional'>[" + str + "]</span>"
      else
        str
      end
    end

    def optional?(param)
      return param[:doc] =~ /\(optional\)/
    end
  end

end
