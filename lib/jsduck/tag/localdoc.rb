require "jsduck/tag/tag"
require 'jsduck/format/shortener'

module JsDuck::Tag
  # Non-inheritable documentation
  class Localdoc < Tag
    def initialize
      @pattern = "localdoc"
      @tagname = :localdoc
      @html_position = POS_LOCALDOC
    end

    def parse_doc(p, pos)
      {
        :tagname => :localdoc,
        :doc => :multiline,
      }
    end

    def process_doc(m, tags, pos)
      m[:localdoc] = tags.map {|t| t[:doc] }.join("\n\n")
    end

    def format(m, formatter)
      m[:localdoc] = formatter.format(m[:localdoc])
    end

    def to_html(m)
      m[:localdoc]
    end

  end
end
