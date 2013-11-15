require 'jsduck/tag_registry'

module JsDuck
  module Web

    # Creates an array of small hashes documenting name, parent class
    # and icon of a class.
    class Icons
      def create(classes)
        classes.map do |cls|
          {
            :name => cls[:name],
            :extends => cls[:extends],
            :private => cls[:private],
            :icon => Web::Icons::class_icon(cls),
          }
        end
      end

      # Returns CSS class name for an icon of class
      def self.class_icon(cls)
        TagRegistry.class_icon_providers.each do |tagname|
          if cls[tagname]
            return TagRegistry.get_by_name(tagname).class_icon
          end
        end

        return "icon-class"
      end
    end

  end
end
