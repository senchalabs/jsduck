module JsDuck
  module Warning

    # A composite warning, encompassing all the other warning types.
    class All

      # Creates a deprecated warning with a mapping to :nodoc warning
      # type with given parameters.  The warning is disabled by
      # default.
      def initialize(warnings)
        @warnings = warnings
      end

      # Enables/disables all warnings.
      def set(enabled, path_pattern=nil, params=[])
        # When used with a path_pattern, only add the pattern to the rules
        # where it can have an effect - otherwise we get a warning.
        @warnings.each do |w|
          w.set(enabled, path_pattern, params) unless path_pattern && w.enabled? == enabled
        end
      end

      # Doesn't make sense to check if the :all warning is enabled.
      def enabled?(filename="", params=[])
        raise "Warning type 'all' must not be checked for enabled/disabled"
      end

      # The all-warning is documented separately
      def doc
        nil
      end

    end

  end
end
