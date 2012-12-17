module JsDuck::Builtins
  # Base class for all builtin tags.
  class Tag
    # Defines the name of the @tag.
    # The name itself must not contain the "@" sign.
    # For example: "cfg"
    attr_reader :pattern

    # Called by DocParser when the @tag is reached to do the parsing
    # from that point forward.  Gets passed an instance of DocParser.
    def parse(p)
    end

    # Returns all descendants of JsDuck::Builtins::Tag class.
    def self.descendants
      result = []
      ObjectSpace.each_object(::Class) do |cls|
        result << cls if cls < self
      end
      result
    end
  end
end
