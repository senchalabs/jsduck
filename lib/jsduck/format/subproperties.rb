require 'jsduck/util/html'
require 'jsduck/logger'
require 'jsduck/type_parser'

module JsDuck
  module Format

    # Helper for recursively formatting subproperties.
    class Subproperties

      def initialize(formatter, format_types=false)
        @formatter = formatter
        @format_types = format_types
      end

      # Takes a hash of param, return value, throws value or subproperty.
      #
      # - Markdown-formats the :doc field in it.
      # - Parses the :type field and saves HTML to :html_type.
      # - Recursively does the same with all items in :properties field.
      #
      def format(item)
        item[:doc] = @formatter.format(item[:doc]) if item[:doc]

        if item[:type]
          item[:html_type] = format_type(item[:type])
        end

        if item[:properties]
          item[:properties].each {|p| format(p) }
        end
      end

      # Formats the given type definition string using TypeParser.
      #
      # - On success returns HTML-version of the type definition.
      # - On failure logs error and returns the type string with only HTML escaped.
      #
      def format_type(type)
        # Skip the formatting entirely when type-parsing is turned off.
        return Util::HTML.escape(type) unless @format_types

        tp = TypeParser.new(@formatter)
        if tp.parse(type)
          tp.out
        else
          context = @formatter.doc_context
          if tp.error == :syntax
            Logger.warn(:type_syntax, "Incorrect type syntax #{type}", context[:filename], context[:linenr])
          else
            Logger.warn(:type_name, "Unknown type #{type}", context[:filename], context[:linenr])
          end
          Util::HTML.escape(type)
        end
      end

    end

  end
end
