require 'jsduck/util/html'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc

    # Inserts table of contents at the top of guide HTML by looking
    # for <h2> elements.
    def self.inject(html, guide_name, max_level)
      toc = []
      new_html = []

      previous_level = 1
      uls_to_close = 0
      uls_to_open = 0
      html.each_line do |line|
        if line =~ /^\s*<(h([1-6]))>(.*?)<\/h[1-6]>$/

          tag = $1
           level = $2.to_i - 1 # ignore <h1>
           text = Util::HTML.strip_tags($3)
           id = guide_name + "-section-" + title_to_id(text)
           if (1...max_level).include? level            
            if level == previous_level
              # Add new list item to current ul
              toc << "<li><a href='#!/guide/#{id}'>#{text}</a>"
            end
            if level > previous_level
              # Open a new ul for each additional level
              # then add the list item
              uls_to_open = level - previous_level                     
              for i in 1..uls_to_open
                toc << "<ul>"
              end
              toc << "<li><a href='#!/guide/#{id}'>#{text}</a>"
            end
            if level < previous_level
              # Close all previously opened <ul>s between the previous and current heading levels
              # then add the list item
              uls_to_close = previous_level - level       
              for i in 1..uls_to_close
                toc << "</ul>"
              end
              toc << "<li><a href='#!/guide/#{id}'>#{text}</a>"
            end
            previous_level = level
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
