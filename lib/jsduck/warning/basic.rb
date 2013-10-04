require 'jsduck/warning/warn_exception'

module JsDuck
  module Warning

    # A basic warning type.
    class Basic

      # Creates a simple warning with a message text.
      # The warning is disabled by default.
      def initialize(type, msg)
        @type = type
        @msg = msg

        @rules = []
        # disable by default
        set(false)
      end

      # Enables or disables the warning.
      # Optionally enables/disables it for files matching a path_pattern.
      # params array is not used for the basic warning type.
      def set(enabled, path_pattern=nil, params=[])
        if path_pattern
          # Prepend to the front of array, so we can use #find to
          # search for the latest rule.
          @rules.unshift({
            :enabled => enabled,
            :path_re => Regexp.new(Regexp.escape(path_pattern))
          })
        else
          # When no path specified, the warning is turned on/off
          # globally, so we can discard all the existing rules and
          # start over with just one.
          @rules = [{
            :enabled => enabled,
            :path_re => nil
          }]
        end
      end

      # True when warning is enabled for the given filename.
      # (The params parameter is ignored).
      def enabled?(filename="", params=[])
        # Find the most recently added rule that has an effect to our current item
        @rules.find {|r| r[:path_re].nil? || r[:path_re] =~ filename }[:enabled]
      end

      # Documentation for the warning.
      def doc
        " #{@enabled ? '+' : '-'}#{@type} - #{@msg}"
      end

    end

  end
end
