require "jsduck/tag/tag"
require "jsduck/logger"

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

    def format(m, formatter)
      cls = formatter.relations[m[:owner]]

      m[:fires] = m[:fires].map do |name|
        if cls.find_members({:tagname => :event, :name => name}).length > 0
          formatter.link(m[:owner], name, name, :event)
        else
          JsDuck::Logger.warn(:fires, "@fires references unknown event: #{name}", m[:files][0])
          name
        end
      end
    end

    def to_html(m)
      return unless m[:fires] && m[:fires].length > 0

      return [
        "<h3 class='pa'>Fires</h3>",
        "<ul>",
          m[:fires].map {|e| "<li>#{e}</li>" },
        "</ul>",
      ]
    end
  end
end
