require 'jsduck/tag_registry'
require 'jsduck/logger'
require 'fileutils'

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
                background: url(class-icons/#{tag.tagname}-large.png) no-repeat 0 -5px; }
            #treecontainer .x-grid-cell-inner .icon-#{tag.tagname} {
                background: url(class-icons/#{tag.tagname}.png) no-repeat; }
            #search-dropdown .icon-#{tag.tagname} {
                background: url(class-icons/#{tag.tagname}.png) no-repeat; }
            #search-dropdown .icon-#{tag.tagname}-redirect {
                background: url(class-icons/#{tag.tagname}-redirect.png) no-repeat; }
            .doctabs .icon-#{tag.tagname} {
                background: url(class-icons/#{tag.tagname}.png) no-repeat; }
          EOCSS
        end
        css.join("\n")
      end

      # Copies all class icons to given destination dir.
      def self.write(dir)
        FileUtils.mkdir(dir)

        icons = {}
        class_icon_providers.each do |tag|
          icons[tag.class_icon[:small]] = "#{dir}/#{tag.tagname}.png"
          icons[tag.class_icon[:large]] = "#{dir}/#{tag.tagname}-large.png"
          icons[tag.class_icon[:redirect]] = "#{dir}/#{tag.tagname}-redirect.png"
        end

        icons.each_pair do |source, target|
          if File.exists?(source)
            FileUtils.cp(source, target)
          else
            Logger.warn(nil, "Class icon file not found", source)
          end
        end
      end

      def self.class_icon_providers
        @providers ||= TagRegistry.class_icon_providers.sort do |a, b|
          a.class_icon[:priority] <=> b.class_icon[:priority]
        end.reverse
      end
    end

  end
end
