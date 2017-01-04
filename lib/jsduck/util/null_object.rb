module JsDuck
  module Util

    # A class that does nothing.
    # Responds to all methods by returning self, unless a hash passed to
    # constructor.
    # See: http://en.wikipedia.org/wiki/Null_Object_pattern
    class NullObject
      # Optionally takes a hash of method_name => return_value pairs,
      # making it return those values for those methods, sort of like
      # OpenStruct, but for all other methods self is still returned and
      # any number of arguments is accepted.
      def initialize(methods={})
        @methods = methods
      end

      def method_missing(meth, *args, &block)
        @methods.has_key?(meth) ? @methods[meth] : self
      end
    end

  end
end
