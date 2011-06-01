module JsDuck

  # Renders method/event parameters list in long form
  # for use in documentation body.
  class LongParams
    def initialize(formatter)
      @formatter = formatter
    end

    def render(params)
      if params.length > 0
        "<ul>" + params.collect {|p| render_single(p) }.join("") + "</ul>"
      else
        "<ul><li>None.</li></ul>"
      end
    end

    def render_single(param)
      doc = @formatter.format(param[:doc])
      type = @formatter.replace(param[:type])
      return [
        "<li>",
        "<code>#{param[:name]}</code> : #{type}",
        "<div class='sub-desc'>#{doc}</div>",
        "</li>",
      ].join("")
    end
  end

end
