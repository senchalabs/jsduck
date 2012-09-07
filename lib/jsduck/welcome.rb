require 'jsduck/null_object'
require 'jsduck/util/io'

module JsDuck

  class Welcome
    # Creates Welcome object from filename.
    def self.create(filename)
      if filename
        Welcome.new(filename)
      else
        NullObject.new(:to_html => "")
      end
    end

    # Parses welcome HTML file with content for welcome page.
    def initialize(filename)
      @html = Util::IO.read(filename)
    end

    # Returns the HTML
    def to_html
      "<div id='welcome-content' style='display:none'>#{@html}</div>"
    end

  end

end
