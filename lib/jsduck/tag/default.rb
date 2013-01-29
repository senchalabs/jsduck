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
      @key = :default
      @merge_context = [:cfg, :property, :css_var]
      @html_position = :bottom
    end

    def merge(h, docs, code)
      h[:default] = JsDuck::DocsCodeComparer.merge_if_matches(:default, docs, code)
    end

    def to_html(m)
      return if m[:default] == "undefined"

      "<p>Defaults to: <code>" + JsDuck::Util::HTML.escape(m[:default]) + "</code></p>"
    end
  end
end
