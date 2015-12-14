module JsDuck
  module Process

    # Auto-detects classes inheriting from Ext.Component, and marks
    # them as :component.
    class Components
      def initialize(relations)
        @relations = relations
      end

      def process_all!
        @relations.each do |cls|
          cls[:component] = true if cls.inherits_from?("Ext.Component")
        end
      end
    end

  end
end
