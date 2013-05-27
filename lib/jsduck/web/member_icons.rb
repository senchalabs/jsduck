require 'jsduck/tag_registry'
require 'fileutils'

module JsDuck
  module Web

    # Manages member icons.
    # Generating CSS for them and coping the image files over to output dir.
    class MemberIcons
      # Generates CSS for member icons
      def self.css
        css = []
        members_with_icons.each do |m|
          name = m[:name]
          rule = ".icon-#{name} { background-image: url(member-icons/#{name}.png); background-repeat: no-repeat; }"
          css << "#search-dropdown #{rule}"
          css << ".members .members-section #{rule}"
          css << ".members .comments-section #{rule}"
          css << ".class-overview .x-toolbar.member-links #{rule}"
        end
        css.join("\n")
      end

      # Copies all member icons to given destination dir.
      def self.write(dir)
        FileUtils.mkdir(dir)

        members_with_icons.each do |m|
          if File.exists?(m[:icon])
            FileUtils.cp(m[:icon], "#{dir}/#{m[:name]}.png")
          else
            Logger.warn(nil, "Member icon file not found", m[:icon])
          end
        end
      end

      def self.members_with_icons
        TagRegistry.member_types.find_all {|m| m[:icon] }
      end
    end

  end
end
