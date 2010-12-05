module JsDuck

  # Renders method/event parameters list in short form
  # for use in signatures
  class ShortParams
    def render(params)
      if params.length > 0
        "( " + params.collect {|p| render_single(p) }.join(", ") + " )"
      else
        "()"
      end
    end

    def render_single(param)
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
