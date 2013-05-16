require 'jsduck/util/html'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc

    # Inserts table of contents at the top of guide HTML by looking
    # for <h2> or <h3> elements.
    def self.inject(html, guide_name)
      toc = []
      new_html = []
      i = 0
      j = 0

      html.each_line do |line|
        if line =~ /^\s*<(h[1-6])>(.*?)<\/h[1-6]>$/
          tag = $1
          text = Util::HTML.strip_tags($2)
          id = guide_name + "-section-" + title_to_id(text)
          if tag == "h2"
            i += 1
            j = 0
            toc << "#{i}. <a href='#!/guide/#{id}'>#{text}</a><br/>\n"
          elsif tag == "h3"
            j += 1
            toc << "#{i}.#{j}. <a href='#!/guide/#{id}'>#{text}</a><br/>\n"
          end
          new_html << "<#{tag} id='#{id}'>#{text}</#{tag}>\n"
        else
          new_html << line
        end
      end

      # Inject TOC below first heading if at least 2 items in TOC
      if toc.length >= 2
        new_html.insert(1, [
            "<div class='toc'>\n",
            "<p><strong>Contents</strong></p>\n",
            toc,
            "</div>\n",
        ])
      end

      new_html.flatten.join
    end

    def self.title_to_id(title)
      CGI::escape(title.downcase.gsub(/ /, "-"))
    end

  end

end
