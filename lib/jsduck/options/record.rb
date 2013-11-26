module JsDuck
  module Options

    # Stores values of command line options.
    #
    # All options are initially defined with an #attribute method, which
    # ensures that accessing an unexisting option will result in an
    # error.
    class Record
      def initialize
        @validators = {}
      end

      # Defines accessor for an option,
      # and assigns a default value for it.
      def attribute(name, default=nil)
        instance_variable_set("@#{name}", default)
        # Use `send` to invoke private attr_accessor method.  As we only
        # expect a single OptionsRecord to exist for the lifetime of the
        # app, it should be safe to define a method on a class.
        self.class.send(:attr_accessor, name)
      end

      # Defines a validator function that gets run after all the
      # options have been parsed.  When validation fails, the function
      # should return an error message string (or an array of string
      # for multi-line error message) otherwise nil, to signify
      # success.
      def validator(name, &block)
        @validators[name] = block
      end

      # Runs all the validators.  Returns an error message string from
      # the first failed validation or nil when everything is OK.
      #
      # Alternatively runs just one validator by name. Used in testing.
      def validate!(name=nil)
        validators = name ? [@validators[name]] : @validators

        validators.each do |block|
          if err = block.call()
            return err
          end
        end
        return nil
      end

    end

  end
end
