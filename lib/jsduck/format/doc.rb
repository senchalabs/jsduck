require 'strscan'
require 'rdiscount'
require 'jsduck/format/html_stack'
require 'jsduck/format/subproperties'
require 'jsduck/inline/link'
require 'jsduck/inline/auto_link'
require 'jsduck/inline/link_renderer'
require 'jsduck/inline/img'
require 'jsduck/inline/video'
require 'jsduck/inline/example'
require 'ostruct'

module JsDuck
  module Format

    # Formats doc-comments
    class Doc

      # Creates a formatter configured with options originating from
      # command line.  For the actual effect of the options see
      # Inline::* classes.
      def initialize(relations={}, opts=OpenStruct.new)
        @relations = relations
        @opts = opts
        @subproperties = Format::Subproperties.new(self)
        @link_renderer = Inline::LinkRenderer.new(relations, opts)
        @inline_link = Inline::Link.new(@link_renderer)
        @auto_link = Inline::AutoLink.new(@link_renderer)
        @inline_img = Inline::Img.new(opts)
        @inline_video = Inline::Video.new(opts)
        @inline_example = Inline::Example.new(opts)
        @doc_context = {}
      end

      # Access to the relations object.
      # (Used by TypeParser.)
      attr_reader :relations

      # Accessors to the images attribute of Inline::Img
      def images=(images)
        @inline_img.images = images
      end
      def images
        @inline_img.images
      end

      # Sets up instance to work in context of particular class, so
      # that when {@link #blah} is encountered it knows that
      # Context#blah is meant.
      def class_context=(cls)
        @inline_link.class_context = cls
        @auto_link.class_context = cls
      end

      # Sets up instance to work in context of particular doc object.
      # Used for error reporting.
      def doc_context=(doc)
        @doc_context = doc
        @inline_video.doc_context = doc
        @inline_link.doc_context = doc
        @auto_link.doc_context = doc
        @inline_img.doc_context = doc
      end

      # Returns the current documentation context
      def doc_context
        @doc_context
      end

      # Formats doc-comment for placement into HTML.
      # Renders it with Markdown-formatter and replaces @link-s.
      def format(input)
        # In ExtJS source "<pre>" is often at the end of paragraph, not
        # on its own line.  But in that case RDiscount doesn't recognize
        # it as the beginning of <pre>-block and goes on parsing it as
        # normal Markdown, which often causes nested <pre>-blocks.
        #
        # To prevent this, we always add extra newline before <pre>.
        input.gsub!(/([^\n])<pre>((<code>)?$)/, "\\1\n<pre>\\2")

        # But we remove trailing newline after <pre> to prevent
        # code-blocks beginning with empty line.
        input.gsub!(/<pre>(<code>)?\n?/, "<pre>\\1")

        replace(RDiscount.new(input).to_html)
      end

      # Replaces {@link} and {@img} tags, auto-generates links for
      # recognized classnames.
      #
      # Replaces {@link Class#member link text} in given string with
      # HTML from --link.
      #
      # Replaces {@img path/to/image.jpg Alt text} with HTML from --img.
      #
      # Adds 'inline-example' class to code examples beginning with @example.
      #
      # Additionally replaces strings recognized as ClassNames or
      # #members with links to these classes or members.  So one doesn't
      # even need to use the @link tag to create a link.
      def replace(input)
        s = StringScanner.new(input)
        out = ""

        # Keep track of open HTML tags. We're not auto-detecting class
        # names when inside <a>. Also we want to close down the unclosed
        # tags.
        tags = Format::HtmlStack.new(@opts.ignore_html || {}, @doc_context)

        while !s.eos? do
          if substitute = @inline_link.replace(s)
            out += substitute
          elsif substitute = @inline_img.replace(s)
            out += substitute
          elsif substitute = @inline_video.replace(s)
            out += substitute
          elsif s.check(/[{]/)
            # There might still be "{" that doesn't begin {@link} or {@img} - ignore it
            out += s.scan(/[{]/)
          elsif substitute = @inline_example.replace(s)
            tags.push_tag("pre")
            tags.push_tag("code")
            out += substitute
          elsif s.check(/<\w/)
            # Open HTML tag
            out += tags.open(s)
          elsif s.check(/<\/\w+>/)
            # Close HTML tag
            out += tags.close(s)
          elsif s.check(/</)
            # Ignore plain '<' char.
            out += s.scan(/</)
          else
            # Replace class names in the following text up to next "<" or "{"
            # but only when we're not inside <a>...</a>
            text = s.scan(/[^{<]+/)
            out += tags.open?("a") ? text : @auto_link.replace(text)
          end
        end

        out
      end

      # Creates a link based on the link template.
      def link(cls, member, anchor_text, type=nil, static=nil)
        @link_renderer.link(cls, member, anchor_text, type, static)
      end

      # Turns type parsing on or off.
      #
      # Used to skipping parsing of CSS var and mixin types.
      def skip_type_parsing=(skip)
        @subproperties.skip_type_parsing = skip
      end

      # Recursively formats a subproperty.
      # See Format::Subproperties#format for details.
      def format_subproperty(item)
        @subproperties.format(item)
      end

      # Parses and formats type definition.
      # Returns HTML-rendering of the type.
      # See Format::Subproperties#format_type for details.
      def format_type(type)
        @subproperties.format_type(type)
      end

    end

  end
end
