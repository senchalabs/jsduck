require 'jsduck/logger'

module JsDuck
  module Process

    class Enums
      def initialize(classes_hash)
        @classes_hash = classes_hash
      end

      # Applies additional processing to all enum-classes.
      def process_all!
        @classes_hash.each_value do |cls|
          if cls[:enum]
            process(cls)
          end
        end
      end

      private

      # processes single class
      def process(cls)
        expand_default(cls)
        reject_not_properties(cls)
        strip_inheritdoc(cls)
        cls[:enum][:type] = infer_type(cls) unless cls[:enum][:type]
      end

      # Expands default value like widget.* into list of properties
      def expand_default(cls)
        if cls[:enum][:default] =~ /\A(.*)\.\*\z/
          each_alias($1) do |name, owner|
            cls[:members] << {
              :tagname => :property,
              :id => 'property-' + name,
              :name => name,
              :default => "'" + name + "'",
              :type => "String",
              :private => owner[:private],
              :files => cls[:files],
              :owner => cls[:name],
              :doc => "Alias for {@link #{owner[:name]}}.",
            }
          end
        end
      end

      def each_alias(prefix)
        @classes_hash.each_value do |cls|
          if cls[:aliases] && cls[:aliases][prefix]
            cls[:aliases][prefix].each {|name| yield(name, cls) }
          end
        end
      end

      # Only allow properties as members, throw away all others.
      def reject_not_properties(cls)
        cls[:members].reject! do |m|
          if m[:tagname] == :property
            false
          else
            Logger.warn(:enum, "Enums can only contain properties, #{m[:tagname]} found instead.", m[:files][0])
            true
          end
        end
      end

      # Remove the auto-inserted inheritdoc tag so the auto-detected enum
      # values default to being public.
      def strip_inheritdoc(cls)
        cls[:members].each do |p|
          p[:inheritdoc] = nil if p[:autodetected] && p[:autodetected][:tagname]
        end
      end

      # Given an enum class, returns the type infered from its values.
      def infer_type(cls)
        if cls[:members].length > 0
          types = cls[:members].map {|p| p[:type] }
          types.sort.uniq.join("/")
        else
          "Object"
        end
      end

    end

  end
end
