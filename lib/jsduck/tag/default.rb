require "jsduck/tag/tag"

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
      @merge_context = :property_like
    end

    def merge(h, docs, code)
      h[:default] = merge_if_code_matches(:default, docs, code)
    end

    private

    def merge_if_code_matches(key, docs, code, default=nil)
      if docs[key]
        docs[key]
      elsif code[key] && code_matches_doc?(docs, code)
        code[key]
      else
        default
      end
    end

    # True if the name detected from code matches with explicitly documented name.
    # Also true when no explicit name documented.
    def code_matches_doc?(docs, code)
      return docs[:name] == nil || docs[:name] == code[:name]
    end
  end
end
