require "jsduck/builtins/tag"

module JsDuck::Builtins
  class Singleton < Tag
    def initialize
      @pattern = "singleton"
    end

    # @singleton
    def parse(p)
      p.add_tag(:singleton)
    end
  end
end
