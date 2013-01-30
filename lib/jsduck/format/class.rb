require 'jsduck/tag_registry'
require 'jsduck/format/subproperties'

module JsDuck
  module Format

    # Converts :doc properties of class from markdown to HTML, resolves
    # @links, and converts type definitions to HTML.
    class Class
      # Set to false to disable HTML-formatting of type definitions.
      attr_accessor :include_types

      def initialize(formatter)
        @formatter = formatter
        @include_types = true
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

        format_tags(m)

        subs = make_subproperties_formatter(m)

        m[:html_type] = subs.format_type(m[:type]) if m[:type]
        m[:params].each {|p| subs.format(p) } if m[:params]
        subs.format(m[:return]) if m[:return]
        m[:throws].each {|t| subs.format(t) } if m[:throws]
        m[:properties].each {|p| subs.format(p) } if m[:properties]
      end

      def make_subproperties_formatter(m)
        # We don't validate and format CSS var and mixin type definitions
        is_css_tag = m[:tagname] == :css_var || m[:tagname] == :css_mixin
        # Also don't check types when @include_types setting is explicitly turned off
        check_types = @include_types && !is_css_tag

        return Format::Subproperties.new(@formatter, check_types)
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
