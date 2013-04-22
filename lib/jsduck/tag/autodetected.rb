require "jsduck/tag/tag"

module JsDuck::Tag
  # There is no @autodetected tag.
  #
  # This tag class exists to take care of the merging of :autodetected
  # field.
  class Autodetected < Tag
    def initialize
      @tagname = :autodetected
      @merge_context = [:class, :member]
    end

    def merge(h, docs, code)
      if docs[:autodetected] || code[:autodetected]
        h[:autodetected] = (code[:autodetected] || {}).merge(docs[:autodetected] || {})
      end
    end
  end
end
