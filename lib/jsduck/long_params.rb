require "jsduck/doc_formatter"

module JsDuck

  # Renders method/event parameters list in long form
  # for use in documentation body.
  class LongParams
    def initialize(cls)
      @formatter = DocFormatter.new(cls.full_name)
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
      return [
        "<li>",
        "<code>#{param[:name]}</code> : #{param[:type]}",
        "<div class='sub-desc'>#{doc}</div>",
        "</li>",
      ].join("")
    end
  end

end
