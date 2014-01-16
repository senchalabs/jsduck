require 'jsduck/external_classes'

module JsDuck

  # Provides information about relations between classes.
  #
  # Also provides a place to look up classes by name.
  #
  # The constructor is initialized with array of all available classes
  # and list of class names to ignore.  By default the latter list
  # contains only JavaScript base class "Object".
  class Relations
    # Returns list of all classes
    attr_reader :classes

    def initialize(classes = [], ignorables = [])
      @classes = classes
      @external_classes = ExternalClasses.new(ignorables)

      # First build class lookup table; building lookup tables for
      # mixins and subclasses will depend on that.
      @lookup = {}
      @classes.each do |cls|
        @lookup[cls[:name]] = cls
        (cls[:alternateClassNames] || []).each do |alt_name|
          @lookup[alt_name] = cls
        end
        cls.relations = self
      end

      @subs = {}
      @mixes = {}
      @classes.each do |cls|
        reg_subclasses(cls)
        reg_mixed_into(cls)
      end
    end

    # Looks up class by name, nil if not found
    def [](classname)
      @lookup[classname]
    end

    # Returns true if class is in list of ignored classes.
    def ignore?(classname)
      @external_classes.is?(classname)
    end

    def each(&block)
      @classes.each(&block)
    end

    # Returns list of all classes.  This method allows us to treat
    # Relations as array and therefore easily mock it
    def to_a
      @classes
    end

    def reg_subclasses(cls)
      if !cls.parent
        # do nothing
      elsif @subs[cls.parent[:name]]
        @subs[cls.parent[:name]] << cls
      else
        @subs[cls.parent[:name]] = [cls]
      end
    end

    # Returns subclasses of particular class, empty array if none
    def subclasses(cls)
      @subs[cls[:name]] || []
    end

    def reg_mixed_into(cls)
      cls.mixins.each do |mix|
        if @mixes[mix[:name]]
          @mixes[mix[:name]] << cls
        else
          @mixes[mix[:name]] = [cls]
        end
      end
    end

    # Returns classes having particular mixin, empty array if none
    def mixed_into(cls)
      @mixes[cls[:name]] || []
    end
  end

end
