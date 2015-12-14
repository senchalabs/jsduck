require "jsduck/tag/tag"
require "jsduck/util/html"

module JsDuck::Tag
  # There is no @default tag.
  #
  # Default values are detected from syntax like this:
  #
  #     @cfg [blah=somedefault]
  #
  # This tag class exists to generate the "Defaults to:" text in final
  # HTML.
  class Default < Tag
    def initialize
      @tagname = :default
      @html_position = POS_DEFAULT
    end

    def to_html(m)
      return if m[:default] == "undefined"

      "<p>Defaults to: <code>" + JsDuck::Util::HTML.escape(m[:default]) + "</code></p>"
    end
  end
end
