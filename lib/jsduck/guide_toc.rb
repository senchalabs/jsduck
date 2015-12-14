require 'jsduck/util/html'
require 'jsduck/guide_toc_entry'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc
    def initialize(html, guide_name, max_level=2)
      @html = html
      @guide_name = guide_name

      @min_level = 2
      @max_level = max_level

      @toc = GuideTocEntry.new
      @new_html = []
    end

    # Inserts table of contents at the top of guide HTML by looking
<<<<<<< HEAD
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
=======
    # for headings at or below the specified maximum level.
    def inject!
      @html.each_line do |line|
        if line =~ /^\s*<h([1-6])>(.*?)<\/h[1-6]>$/
          level = $1.to_i
          original_text = $2
          text = Util::HTML.strip_tags(original_text)
          id = title_to_id(text)

          if include_to_toc?(level)
            @toc.add(level, id, text)
>>>>>>> senchalabs/master
          end

          @new_html << "<h#{level} id='#{id}'>#{original_text}</h#{level}>\n"
        else
          @new_html << line
        end
      end

<<<<<<< HEAD
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
=======
      inject_toc!
>>>>>>> senchalabs/master

      @new_html.flatten.join
    end

    private

    def include_to_toc?(level)
      (@min_level..@max_level).include?(level)
    end

    def title_to_id(title)
      @guide_name + "-section-" + CGI::escape(title.downcase.gsub(/ /, "-"))
    end

    # Injects TOC below first heading if at least 2 items in TOC
    def inject_toc!
      return if @toc.count < 2

      @new_html.insert(1, [
        "<div class='toc'>\n",
          "<p><strong>Contents</strong></p>\n",
          @toc.to_html,
        "</div>\n",
      ])
    end

  end

end
