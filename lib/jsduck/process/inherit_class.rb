require 'jsduck/logger'

module JsDuck
  module Process

    # Deals with inheriting class documentation.
    class InheritClass
      def initialize(relations)
        @relations = relations
      end

      # Inherits docs for class.
      #
      # For class we only inherit the value of :doc field.
      #
      # When the class we're inheriting from also has @inheritdoc tag,
      # we first recursively resolve the inheritance of that class and
      # only afterwards inherit to the current class.
      def resolve(cls)
        return unless cls[:inheritdoc]

        parent = find_parent(cls)
        if parent && parent[:inheritdoc]
          resolve(parent)
        end

        if parent
          cls[:doc] = parent[:doc] if cls[:doc].empty?
        end

        cls[:inheritdoc] = nil
      end

      private

      def find_parent(cls)
        if cls[:inheritdoc][:cls]
          # @inheritdoc MyClass
          parent = @relations[cls[:inheritdoc][:cls]]
          return warn("class not found", cls) unless parent
        else
          # @inheritdoc
          parent = cls.parent
          return warn("parent class not found", cls) unless parent
        end

        return parent
      end

      def warn(msg, cls)
        Logger.warn(:inheritdoc, "@inheritdoc #{cls[:inheritdoc][:cls]} - #{msg}", cls[:files][0])
        return nil
      end

    end

  end
end
