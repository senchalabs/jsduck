module JsDuck

  # Creates an array of small hashes documenting name, parent class
  # and icon of a class.
  class Icons
    def create(classes, opts)
      json = []
      classes.map do |cls|
        json.push({
          :name => cls[:name],
          :extends => cls[:extends],
          :private => cls[:private] || cls[:meta][:pseudo],
          :icon => icon(cls),
          :isObject => isObject(cls)
        })
        # TIDOC-1071 Modifications to support Cloud DocTree
        if opts.rest
          methods = cls[:members][:method]
          methods.map do |method|
            json.push({
              :name => cls[:name] + "." + method[:name],
              :url => cls[:name] + "-method-" + method[:name],
              :extends => cls[:extends],
              :private => cls[:private] || cls[:meta][:pseudo],
              :icon => "icon-component",
              :isObject => "false"
            })
          end
        end
      end
      json
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
