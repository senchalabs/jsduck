require "jsduck/tag/tag"
require "jsduck/docs_code_comparer"

module JsDuck::Tag
  # There is no @default tag.
  #
  # Default values are detected from syntax like this:
  #
  #     @cfg [blah=somedefault]
  #
  # This tag class exists to take care of the merging of :default
  # fields.
  class Default < Tag
    def initialize
      @merge_context = [:cfg, :property, :css_var]
    end

    def merge(h, docs, code)
      h[:default] = JsDuck::DocsCodeComparer.merge_if_matches(:default, docs, code)
    end
  end
end
