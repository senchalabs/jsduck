require 'jsduck/util/html'

module JsDuck

  # Adds Table of Contents section to guide HTML.
  class GuideToc
    def initialize(html, guide_name, max_level=2)
      @html = html
      @guide_name = guide_name

      @min_level = 2
      @max_level = max_level

      # Count the number of heading increments we've seen so far.
      @heading_counts = Array.new(@max_level+1) { 0 }

      @toc = []
      @new_html = []
    end

    # Inserts table of contents at the top of guide HTML by looking
    # for headings at or below the specified maximum level.
    def inject!
      prev_level = @min_level-1

      @html.each_line do |line|
        if line =~ /^\s*<h([1-6])>(.*?)<\/h[1-6]>$/
          level = $1.to_i
          text = Util::HTML.strip_tags($2)
          id = title_to_id(text)

          if include_to_toc?(level)
            increment_heading_count!(level)
            if level > prev_level
              list_tags = "<ul><li>" * (level - prev_level)
            elsif prev_level > level
              list_tags = "</li></ul></li><li>" * (prev_level - level)
            else
              list_tags = "</li><li>"
            end
            @toc << list_tags + toc_entry(level, id, text)
            prev_level = level
          end

          @new_html << "<h#{level} id='#{id}'>#{text}</h#{level}>\n"
        else
          @new_html << line
        end
      end

      if @toc.length > 0
        @toc[@toc.length-1] += "</li></ul>" * (prev_level - @min_level + 1)
      end

      inject_toc!

      @new_html.flatten.join
    end

    private

    def include_to_toc?(level)
      (@min_level..@max_level).include?(level)
    end

    # Increments count of current heading level.
    # Resets counts of all the subheadings.
    def increment_heading_count!(level)
      @heading_counts[level] += 1
      ((level+1)..@max_level).each { |i| @heading_counts[i] = 0 }
    end

    def toc_entry(level, id, text)
      "#{toc_prefix(level)}. <a href='#!/guide/#{id}'>#{text}</a>\n"
    end

    def toc_prefix(level)
      @heading_counts.slice(@min_level..level).join('.')
    end

    def title_to_id(title)
      @guide_name + "-section-" + CGI::escape(title.downcase.gsub(/ /, "-"))
    end

    # Injects TOC below first heading if at least 2 items in TOC
    def inject_toc!
      return if @toc.length < 2

      @new_html.insert(1, [
        "<div class='toc'>\n",
          "<p><strong>Contents</strong></p>\n",
          @toc,
        "</div>\n",
      ])
    end

  end

end
