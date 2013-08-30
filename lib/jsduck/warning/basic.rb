module JsDuck
  module Warning

    # A basic warning type.
    class Basic

      # Creates a simple warning with a message text.
      # The warning is disabled by default.
      def initialize(type, msg)
        @type = type
        @msg = msg
        @enabled = false
        @patterns = []
      end

      # Enables or disables the warning.
      # Optionally enables/disables it for files matching a path_pattern.
      def set(enabled, path_pattern=nil, params=[])
        if path_pattern
          if @enabled == enabled
            raise "Warning rule '#{enabled ? '+' : '-'}#{@type}:#{path_pattern}' has no effect"
          else
            @patterns << Regexp.new(Regexp.escape(path_pattern))
          end
        else
          @enabled = enabled
          @patterns = []
        end
      end

      # True when warning is enabled for the given filename.
      # (The params parameter is ignored).
      def enabled?(filename="", params=[])
        if @patterns.any? {|re| filename =~ re }
          !@enabled
        else
          @enabled
        end
      end

      # Documentation for the warning.
      def doc
        " #{@enabled ? '+' : '-'}#{@type} - #{@msg}"
      end

    end

  end
end
