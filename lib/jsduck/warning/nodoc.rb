require 'set'

module JsDuck
  module Warning

    # Missing documentation warnings management
    class Nodoc

      TYPES = Set[nil, :class, :member, :param]
      VISIBILITIES = Set[nil, :public, :protected, :private]

      def initialize
        @rules = []
        # disable by default
        set(false)
      end

      # Enables or disables a particular sub-warning
      def set(enabled, type=nil, visibility=nil, path_pattern=nil)
        unless TYPES.include?(type) && VISIBILITIES.include?(visibility)
          raise "Invalid warning parameters: nodoc(#{type},#{visibility})"
        end

        @rules << {
          :enabled => enabled,
          :type => type,
          :visibility => visibility,
          :path_re => path_pattern ? Regexp.new(Regexp.escape(path_pattern)) : nil
        }
      end

      # True when the warning is enabled for the given
      # type/visibility/filename combination.
      def enabled?(type, visibility, filename)
        # Filter out rules that apply to our current item
        matches = @rules.find_all do |r|
          (r[:type].nil? || r[:type] == type) &&
            (r[:visibility].nil? || r[:visibility] == visibility) &&
            (r[:path_re].nil? || r[:path_re] =~ filename)
        end

        return matches.last[:enabled]
      end

    end

  end
end
