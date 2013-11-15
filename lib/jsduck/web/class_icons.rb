require 'jsduck/tag_registry'
require 'jsduck/logger'

module JsDuck
  module Web
    class ClassIcons
      # Returns CSS class name for an icon of class
      def self.get(cls)
        class_icon_providers.each do |tag|
          if cls[tag.tagname]
            return "icon-#{tag.tagname}"
          end
        end

        return "icon-class"
      end

      # Generates CSS for class icons
      def self.css
        css = []
        class_icon_providers.each do |tag|
          css << <<-EOCSS
            #center-container h1.icon-#{tag.tagname} .class-source-link {
                background: url(class-icons/#{tag.tagname}.png) no-repeat 0 -5px; }
          EOCSS
        end
        css.join("\n")
      end

      # Copies all class icons to given destination dir.
      def self.write(dir)
        FileUtils.mkdir(dir)

        class_icon_providers.each do |tag|
          if File.exists?(tag.class_icon)
            FileUtils.cp(tag.class_icon, "#{dir}/#{tag.tagname}.png")
          else
            Logger.warn(nil, "Class icon file not found", tag.class_icon)
          end
        end
      end

      def self.class_icon_providers
        TagRegistry.class_icon_providers
      end
    end

  end
end
