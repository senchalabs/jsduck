module JsDuck

  # Creates an array of small hashes documenting name, parent class
  # and icon of a class.
  class Icons
    def create(classes)
      classes.map do |cls|
        {
          :name => cls[:name],
          :extends => cls[:extends],
          :private => cls[:private] || cls[:meta][:pseudo],
          :icon => icon(cls),
          :isObject => isObject(cls)
        }
      end
    end

    def isObject(cls)
    	return cls[:meta][:typestr] && cls[:meta][:typestr][0].index("Object") == 0
    end

    def icon(cls)
      if cls[:singleton]
        "icon-singleton"
      elsif cls.inherits_from?("Ext.Component")
        "icon-component"
      elsif isObject(cls)
        "icon-object"
      else
        "icon-class"
      end
    end
  end

end
