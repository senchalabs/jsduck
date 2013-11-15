require 'jsduck/tag_registry'

module JsDuck
  module Web
    class ClassIcons
      # Returns CSS class name for an icon of class
      def self.get(cls)
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
