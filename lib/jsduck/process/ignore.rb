module JsDuck
  module Process

    # Gets rid of classes marked with @ignore
    class Ignore
      def initialize(classes)
        @classes = classes
      end

      def process_all!
        @classes.delete_if {|name, cls| cls[:ignore] }
      end
    end

  end
end
