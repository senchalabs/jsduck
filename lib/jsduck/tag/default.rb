require "jsduck/tag/tag"
require "jsduck/docs_code_comparer"
require "jsduck/util/html"

module JsDuck::Tag
  # There is no @default tag.
  #
  # Default values are detected from syntax like this:
  #
  #     @cfg [blah=somedefault]
  #
  # This tag class exists to take care of the merging of :default
  # fields and to generate the "Defaults to:" text in final HTML.
  class Default < Tag
    def initialize
      @tagname = :default
      @merge_context = :property_like
      @html_position = POS_DEFAULT
    end

    def merge(h, docs, code)
      JsDuck::DocsCodeComparer.merge_if_matches(h, :default, docs, code)
    end

    def to_html(m)
      return if m[:default] == "undefined"

      "<p>Defaults to: <code>" + JsDuck::Util::HTML.escape(m[:default]) + "</code></p>"
    end
  end
end
