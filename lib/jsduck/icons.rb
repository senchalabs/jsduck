module JsDuck

  # Creates an array of small hashes documenting name, parent class
  # and icon of a class.
  class Icons
    def create(classes)
      classes.map do |cls|
        {
          :name => cls[:name],
          :extends => cls[:extends],
          :icon => icon(cls),
        }
      end
    end

    def icon(cls)
      if cls[:singleton]
        "icon-singleton"
      elsif cls.inherits_from?("Ext.Component")
        "icon-component"
      else
        "icon-class"
      end
    end
  end

end
