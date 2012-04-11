module JsDuck

  # Creates an array of small hashes documenting name, parent class
  # and icon of a class.
  class Icons
    def create(classes)
      classes.map do |cls|
        {
          :name => cls[:name],
          :extends => cls[:extends],
          :private => cls[:private],
          :icon => cls.icon,
        }
      end
    end
  end

end
