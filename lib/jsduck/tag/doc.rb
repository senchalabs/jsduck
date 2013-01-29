require "jsduck/tag/tag"

module JsDuck::Tag
  # A special class for rendering the documentation field inside
  # classes and members.
  class Doc < Tag
    def initialize
      @key = :doc
      @html_position = POS_DOC
    end

    def format(m, formatter)
      m[:doc] = formatter.format(m[:doc])
    end

    def to_html(m)
      m[:doc]
    end
  end
end
