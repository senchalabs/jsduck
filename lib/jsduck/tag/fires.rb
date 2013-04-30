require "jsduck/tag/tag"

module JsDuck::Tag
  class Fires < Tag
    def initialize
      @pattern = "fires"
      @tagname = :fires
      @repeatable = true
      @html_position = POS_FIRES
    end

    # @fires eventname
    def parse_doc(p, pos)
      {:tagname => :fires, :events => ident_list(p)}
    end

    # matches <ident> <ident> ... until line end
    def ident_list(p)
      list = []
      while ident = p.hw.ident
        list << ident
      end
      list
    end

    def process_doc(h, tags, pos)
      h[:fires] = tags.map {|t| t[:events] }.flatten
    end

    def to_html(m)
      return [
        "<h3 class='pa'>Fires</h3>",
        "<ul>",
          m[:fires].map {|f| "<li>#{f}</li>" },
        "</ul>",
      ]
    end
  end
end
