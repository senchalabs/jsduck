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
      str = "<code>#{param[:type]} #{param[:name]}</code>"
      if param[:optional]
        "<span title='Optional' class='optional'>[" + str + "]</span>"
      else
        str
      end
    end
  end

end
