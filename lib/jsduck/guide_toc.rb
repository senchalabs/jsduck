require 'jsduck/util/html'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc

    # Inserts table of contents at the top of guide HTML by looking
    # for <h2> elements.
    def self.inject(html, guide_name)
      toc = [
        "<div class='toc'>\n",
        "<p><strong>Contents</strong></p>\n",
        "<ol>\n",
      ]

      new_html = []
      i = 0

      html.each_line do |line|
        if line =~ /^<h2>(.*)<\/h2>$/
          i += 1
          text = Util::HTML.strip_tags($1)
          toc << "<li><a href='#!/guide/#{guide_name}-section-#{i}'>#{text}</a></li>\n"
          new_html << "<h2 id='#{guide_name}-section-#{i}'>#{text}</h2>\n"
        else
          new_html << line
        end
      end

      toc << "</ol>\n"
      toc << "</div>\n"

      # Inject TOC below first heading if at least 2 items in TOC
      if i >= 2
        new_html.insert(1, toc)
        new_html.flatten.join
      else
        html
      end
    end

  end

end
