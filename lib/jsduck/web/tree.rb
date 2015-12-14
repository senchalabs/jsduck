require 'jsduck/web/class_icons'

module JsDuck
  module Web

    # Creates an array of small hashes documenting name, parent class
    # and icon of a class.  Used to generate the class tree in Web UI.
    class Tree
      def self.create(classes)
        classes.map do |cls|
          {
            :name => cls[:name],
            :extends => cls[:extends],
            :private => cls[:private],
            :icon => Web::ClassIcons.get(cls),
          }
        end
      end
    end

  end
end
