require 'jsduck/warning/warn_exception'

module JsDuck
  module Warning

    # A deprecated :no_doc* warning which maps to the new :nodoc
    # warning.
    class Deprecated

      # Creates a deprecated warning with a mapping to :nodoc warning
      # type with given parameters.  The warning is disabled by
      # default.
      def initialize(type, msg, nodoc, params)
        @type = type
        @msg = msg
        @enabled = false
        @nodoc = nodoc
        @params = params
      end

      # Enables or disables the mapped :nodoc warning.
      def set(enabled, path_pattern=nil, params=[])
        @nodoc.set(enabled, path_pattern, @params)
        raise WarnException, "Warning type #{@type} is deprecated, use nodoc(#{@params.join(',')}) instead"
      end

      # This method shouldn't be called.
      def enabled?(filename="", params=[])
        raise "Deprecated warning '#{@type}' must not be checked for enabled/disabled"
      end

      # Documentation for the warning.
      def doc
        " -#{@type} - #{@msg} DEPRECATED"
      end

    end

  end
end
