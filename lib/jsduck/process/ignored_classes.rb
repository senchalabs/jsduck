module JsDuck
  module Process

    # Gets rid of classes marked with @ignore
    class IgnoredClasses
      def initialize(classes_hash)
        @classes_hash = classes_hash
      end

      def process_all!
        @classes_hash.delete_if {|name, cls| cls[:ignore] }
      end
    end

  end
end
