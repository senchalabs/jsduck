module JsDuck
  module Warning

    # Unknown tag warning.
    class Tag

      # Creates the :tag warning type
      def initialize
        @rules = []
        # disable by default
        set(false)
      end

      # Enables or disables a particular sub-warning
      def set(enabled, path_pattern=nil, tagnames=[])
        @rules.unshift({
          :enabled => enabled,
          :tagnames => tagnames,
          :path_re => path_pattern ? Regexp.new(Regexp.escape(path_pattern)) : nil
        })
      end

      # True when the warning is enabled for the given filename and
      # params combination where params contains one tagname.
      def enabled?(filename="", params=[])
        tagname = params[0]

        # Filter out the most recently added rule that applies to our current item
        match = @rules.find do |r|
          (r[:tagnames].empty? || r[:tagnames].include?(tagname)) &&
            (r[:path_re].nil? || r[:path_re] =~ filename)
        end

        return match[:enabled]
      end

      # Extensive documentation for :nodoc warning
      def doc
        [
          "",
          " +tag(<name1>,<name2>,...) - Use of unsupported @tag",
          "",
          "     This warning type can optionally take a list of tag names",
          "     to limit its effect to only these tags.",
          "",
          "     So, to disable warnings for JavaDoc tags @file and @overview",
          "     which aren't supported by JSDuck:",
          "",
          "         --warnings='-tag(file,overview)'",
          "",
        ]
      end

    end

  end
end
