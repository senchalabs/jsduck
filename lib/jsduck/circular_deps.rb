require 'jsduck/logger'

module JsDuck

  # Checks for circular dependencies
  class CircularDeps
    def initialize(classes)
      @classes = classes
    end

    # Checks all classes for circular dependencies.
    #
    # When found, exits with a fatal error message.
    def check_all
      @classes.each do |cls|
        if chain = check(cls)
          Logger.fatal("Class #{cls[:name]} has a circular dependency: #{chain}")
          exit 1
        end
      end
    end

    # Checks class for circular dependencies.
    #
    # When all OK, returns false.
    #
    # When circular dependencies found returns a string describing the
    # problematic dependency chain e.g. "Foo extends Bar mixins Foo".
    def check(cls, names = [])
      names += [cls[:name]]

      if cls.parent && chain = track_circular(" extends ", cls.parent, names)
        return chain
      end

      cls.mixins.each do |mixin|
        if chain = track_circular(" mixins ", mixin, names)
          return chain
        end
      end

      false
    end

    def track_circular(type, cls, names)
      names += [type]
      if names.include?(cls[:name])
        (names + [cls[:name]]).join("")
      else
        check(cls, names)
      end
    end

  end

end
