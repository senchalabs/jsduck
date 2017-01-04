require 'jsduck/util/null_object'
require 'jsduck/util/io'

module JsDuck

  class Welcome
    # Creates Welcome object from filename.
    def self.create(filename, doc_formatter)
      if filename
        Welcome.new(filename, doc_formatter)
      else
        Util::NullObject.new(:to_html => "")
      end
    end

    # Parses welcome HTML or Markdown file with content for welcome page.
    def initialize(filename, doc_formatter)
      @html = Util::IO.read(filename)
      if filename =~ /\.(md|markdown)\Z/i
        @html = '<div class="markdown">' + doc_formatter.format(@html) + '</div>'
      end
    end

    # Returns the HTML
    def to_html(style="")
      "<div id='welcome-content' style='#{style}'>#{@html}</div>"
    end

  end

end
