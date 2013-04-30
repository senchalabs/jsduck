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
      h[:fires] = tags.map {|t| t[:events] }.flatten.map {|name| {:name => name} }
    end

    def format(m, formatter)
      cls = formatter.relations[m[:owner]]

      m[:fires].each do |e|
        if cls.find_members({:tagname => :event, :name => e[:name]}).length > 0
          e[:link] = formatter.link(m[:owner], e[:name], e[:name], :event)
        else
          JsDuck::Logger.warn(:fires, "@fires references unknown event: #{e[:name]}", m[:files][0])
          e[:link] = e[:name]
        end
      end
    end

    def to_html(m)
      return [
        "<h3 class='pa'>Fires</h3>",
        "<ul>",
          m[:fires].map {|e| "<li>#{e[:link]}</li>" },
        "</ul>",
      ]
    end
  end
end
