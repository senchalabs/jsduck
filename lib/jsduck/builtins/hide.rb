require "jsduck/builtins/tag"

module JsDuck::Builtins
  # Hides a member in parent class.
  class Hide < Tag
    def initialize
      @pattern = "hide"
      @key = :hide
    end

    # @hide
    def parse(p)
      p.add_tag(:hide)
    end

    def process_doc(docs)
      true
    end
  end
end
