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
          end

          @new_html << "<h#{level} id='#{id}'>#{original_text}</h#{level}>\n"
        else
          @new_html << line
        end
      end

      inject_toc!

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
