require 'jsduck/warning/warn_exception'
require 'set'

module JsDuck
  module Warning

    # Missing documentation warning.
    class Nodoc

      TYPES = Set[nil, :class, :member, :param]
      VISIBILITIES = Set[nil, :public, :protected, :private]

      # Creates the :nodoc warning type
      def initialize
        @rules = []
        # disable by default
        set(false)
      end

      # Enables or disables a particular sub-warning
      def set(enabled, path_pattern=nil, params=[])
        type = params[0]
        visibility = params[1]

        unless TYPES.include?(type) && VISIBILITIES.include?(visibility)
          raise WarnException, "Invalid warning parameters: nodoc(#{type},#{visibility})"
        end

        @rules << {
          :enabled => enabled,
          :type => type,
          :visibility => visibility,
          :path_re => path_pattern ? Regexp.new(Regexp.escape(path_pattern)) : nil
        }
      end

      # True when the warning is enabled for the given filename and
      # params combination, where the params contain type and
      # visibility setting.
      def enabled?(filename="", params=[])
        type = params[0]
        visibility = params[1]

        # Filter out rules that apply to our current item
        matches = @rules.find_all do |r|
          (r[:type].nil? || r[:type] == type) &&
            (r[:visibility].nil? || r[:visibility] == visibility) &&
            (r[:path_re].nil? || r[:path_re] =~ filename)
        end

        return matches.last[:enabled]
      end

      # Extensive documentation for :nodoc warning
      def doc
        [
          "",
          " -nodoc(<type>,<visibility>) - Missing documentation",
          "",
          "     This warning can take parameters with the following values:",
          "",
          "     <type> = class | member | param",
          "     <visibility> = public | protected | private",
          "",
          "     So, to report missing documentation of public classes:",
          "",
          "         --warnings='+nodoc(class,public)'",
          "",
          "     Or, to report missing docs of all protected items in /etc:",
          "",
          "         --warnings='+nodoc(,protected):/etc/'",
          "",
        ]
      end

    end

  end
end
