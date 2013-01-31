require 'jsduck/tag_registry'

module JsDuck
  module Format

    # Performs documentation formatting of a class and all of its
    # members.
    #
    # The actual work is delegated to the #format methods of Tag
    # classes, to which we pass the Format::Doc instance which they
    # can use to perform the formatting.
    #
    # The formatting done by #format methods usually consists of
    # turning :doc properties of class from markdown to HTML,
    # resolving @links, and converting type definitions to HTML.
    class Class
      def initialize(formatter)
        @formatter = formatter
      end

      # Runs the formatter on doc object of a class.
      # Accessed using Class#internal_doc
      def format(cls)
        @formatter.class_context = cls[:name]
        @formatter.doc_context = cls[:files][0]

        format_tags(cls)

        # format all members (except hidden ones)
        cls[:members].each {|m| format_member(m) unless m[:hide] }

        cls
      end

      # Access to the Img::DirSet object inside doc-formatter
      def images
        @formatter.images
      end

      private

      def format_member(m)
        @formatter.doc_context = m[:files][0]

        # Turn off type parsing for CSS vars and mixins
        @formatter.skip_type_parsing = [:css_var, :css_mixin].include?(m[:tagname])

        format_tags(m)
      end

      def format_tags(context)
        TagRegistry.html_renderers.each do |tag|
          if context[tag.key]
            tag.format(context, @formatter)
          end
        end
      end

    end

  end
end
