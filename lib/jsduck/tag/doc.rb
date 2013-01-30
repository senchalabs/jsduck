require "jsduck/tag/tag"
require 'jsduck/format/shortener'

module JsDuck::Tag
  # A special class for rendering the documentation field inside
  # classes and members.
  class Doc < Tag
    def initialize
      @key = :doc
      @html_position = POS_DOC
      @shortener = JsDuck::Format::Shortener.new
    end

    def format(m, formatter)
      m[:doc] = formatter.format(m[:doc])

      if expandable?(m) || @shortener.too_long?(m[:doc])
        m[:short_doc] = @shortener.shorten(m[:doc])
      end
    end

    def to_html(m)
      m[:doc]
    end

    private

    def expandable?(m)
      m[:params] || (m[:properties] && m[:properties].length > 0) || m[:default] || m[:deprecated] || m[:template]
    end
  end
end
