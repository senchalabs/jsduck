require 'singleton'

module JsDuck
  module Util

    # A more convenient Singleton implementation.
    #
    # With the standard ruby Singleton you need to call the methods of
    # your singleton instance as follows:
    #
    #     MyClass.instance.my_method()
    #
    # But with JsDuck::Util::Singleton you can skip the .instance. part:
    #
    #     MyClass.my_method()
    #
    # This also conveniently hides from the calling code the fact that
    # a class is implemented as Singleton - it could just as well only
    # have static methods.
    #
    module Singleton
      def self.included(base)
        base.class_eval do
          include ::Singleton

          # Redirect calls from MyClass.method to MyClass.instance.method
          def self.method_missing(meth, *args, &block)
            self.instance.send(meth, *args, &block)
          end
        end
      end
    end

  end
end
