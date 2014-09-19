require 'jsduck/util/html'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc

    # Inserts table of contents at the top of guide HTML by looking
    # for <h2> elements.
    def self.inject(html, guide_name)
      toc = []
      new_html = []
      max_level = 4

      # Count the number of heading increments we've seen so far; use one fewer
      # than max_level, since <h1> tags don't go in the TOC.
      heading_counts = Array.new(max_level - 1) { 0 }      

      html.each_line do |line|
        if line =~ /^\s*<(h([1-6]))>(.*?)<\/h[1-6]>$/

          tag = $1
           level = $2.to_i - 1 # ignore <h1>
           text = Util::HTML.strip_tags($3)
          id = guide_name + "-section-" + title_to_id(text)
          if (1...max_level).include? level
             heading_counts[level - 1] += 1
             (level...heading_counts.length).each { |i| heading_counts[i] = 0 }
             prefix = heading_counts.slice(0...level).join('.')
             toc << "#{prefix}. <a href='#!/guide/#{id}'>#{text}</a><br/>\n"
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
            "<ul>\n",
            toc,
            "</ul>\n",
            "</div>\n",
        ])
      end

      new_html.flatten.join
    end

    def self.title_to_id(title)
      title.downcase.gsub(/[^\w]+/, "-")
    end

  end

end
