module JsDuck

  # Stores values of command line options.
  #
  # Options can be accessed using normal accessor methods or with
  # Hash-like :[] and :[]= interface.
  #
  # All options are initially defined with an #attribute method, which
  # ensures that accessing an unexisting option will result in an
  # error.
  class OptionsRecord

    # Defines accessor for an option,
    # and assigns a default value for it.
    def attribute(name, default=nil)
      instance_variable_set("@#{name}", default)
      # Use `send` to invoke private attr_accessor method.  As we only
      # expect a single OptionsRecord to exist for the lifetime of the
      # app, it should be safe to define a method on a class.
      self.class.send(:attr_accessor, name)
    end

    # Make options object behave like hash.
    # This allows us to substitute it with hash in unit tests.
    def [](key)
      instance_variable_get("@#{key}")
    end
    def []=(key, value)
      instance_variable_set("@#{key}", value)
    end

  end

end
