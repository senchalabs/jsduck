require 'jsduck/logger'
require 'jsduck/class'
require 'jsduck/process/inherit_class'
require 'jsduck/process/inherit_members'

module JsDuck
  module Process

    # Deals with inheriting documentation
    class InheritDoc
      def initialize(relations)
        @relations = relations
        @inherit_class = InheritClass.new(@relations)
        @inherit_members = InheritMembers.new(@relations)
      end

      # Performs all inheriting
      def process_all!
        @relations.each do |cls|
          @inherit_class.resolve(cls)
          @inherit_members.resolve(cls)
        end

        @relations.each do |cls|
          cls.refresh_member_ids!
        end
      end

    end

  end
end
