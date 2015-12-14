require 'jsduck/logger'

module JsDuck
  module Process

    # Prints warning for each global member.
    # Removes "global" class when --ignore-global option used.
    # Warnings for global members are printed regardless of that setting,
    # but of course can be turned off using --warnings=-global
    class GlobalMembers
      def initialize(classes_hash, opts)
        @classes_hash = classes_hash
        @opts = opts
      end

      def process_all!
        # Do nothing when there's no "global" class.
        return unless @classes_hash["global"]

        # Warnings for each global member
        @classes_hash["global"][:members].each do |m|
          type = m[:tagname].to_s
          name = m[:name]
          Logger.warn(:global, "Global #{type}: #{name}", m[:files][0])
        end

        # Throw away the "global" class when --ignore-global option used
        if @opts.ignore_global
          @classes_hash.delete("global")
        end
      end
    end

  end
end
