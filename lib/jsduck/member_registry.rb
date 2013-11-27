require "jsduck/tag_registry"

module JsDuck

  # Access to member tags
  class MemberRegistry
    class << self
      # Same as #definitions, but returns just the names of member types.
      def names
        definitions.map {|mt| mt[:name] }
      end

      # Returns array of available member type definitions.
      # Sorted in the order defined by :position.
      def definitions
        if !@definitions
          @definitions = TagRegistry.tags.find_all do |tag|
            tag.respond_to?(:member_type) && tag.member_type
          end.map do |tag|
            cfg = tag.member_type
            cfg[:name] = tag.tagname
            cfg
          end
          @definitions.sort! {|a, b| a[:position] <=> b[:position] }
        end

        @definitions
      end

      # Regex for matching member type name in member reference.
      #
      # The regex matches strings like: "method-" or "event-".  It
      # contains a capture group to capture the actual name of the
      # member, leaving out the dash "-".
      def regex
        @regex ||= Regexp.new("(?:(" + names.join("|") + ")-)")
      end
    end
  end

end
