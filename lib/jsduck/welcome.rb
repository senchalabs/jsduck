module JsDuck

  # Reads in HTML file with content for welcome page
  class Welcome
    # Parses welcome HTML file
    def parse(filename)
      @html = IO.read(filename)
    end

    # Returns the HTML
    def to_html
      if @html
        "<div id='welcome-content' style='display:none'>#{@html}</div>"
      else
        ""
      end
    end

  end

end
