module JsDuck

  # Provides information about direct descendants of particular class.
  #
  # The constructor is initialized with array of all available
  # classes.  Then through [] method subclasses of particlular class
  # can be asked for.
  class Subclasses
    def initialize(classes)
      @subs = {}
      classes.each do |cls|
        if !cls.parent
          # do nothing
        elsif @subs[cls.parent.full_name]
          @subs[cls.parent.full_name] << cls
        else
          @subs[cls.parent.full_name] = [cls]
        end
      end
    end

    def [](cls)
      @subs[cls.full_name]
    end
  end

end
