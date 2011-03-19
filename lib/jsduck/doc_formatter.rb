require 'rubygems'
require 'rdiscount'

module JsDuck

  # Formats doc-comments
  class DocFormatter
    # CSS class to add to each link
    attr_accessor :css_class

    # Template for the href URL.
    # Can contain %cls% which is replaced with actual classname.
    # Also '#' and member name is appended to link if needed
    attr_accessor :url_template

    # Sets up instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    attr_accessor :context

    # Maximum length for text that doesn't get shortened, defaults to 120
    attr_accessor :max_length

    def initialize
      @context = ""
      @css_class = nil
      @url_template = "%cls%"
      @max_length = 120
    end

    # Replaces {@link Class#member link text} in given string with
    # HTML links pointing to documentation.  In addition to the href
    # attribute links will also contain ext:cls and ext:member
    # attributes.
    def replace(input)
      input.gsub(/\{@link\s+(\S*?)(?:\s+(.+?))?\}/m) do
        target = $1
        text = $2
        if target =~ /^(.*)#(.*)$/
          cls = $1.empty? ? @context : $1
          member = $2
        else
          cls = target
          member = false
        end

        # Construct link text
        if text
          text = text
        elsif member
          text = (cls == @context) ? member : (cls + "." + member)
        else
          text = cls
        end

        link(cls, member, text)
      end
    end

    # Creates HTML link to class and/or member
    def link(cls, member, label)
      anchor = member ? "#" + member : ""
      url = @url_template.sub(/%cls%/, cls) + anchor
      href = ' href="' + url + '"'
      rel = ' rel="' + cls + anchor + '"'
      cssCls = @css_class ? ' class="' + @css_class + '"' : ''
      "<a" + href + rel + cssCls + ">" + label + "</a>"
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
      input.gsub!(/([^\n])<pre>/, "\\1\n<pre>")

      # But we remove trailing newline after <pre> to prevent
      # code-blocks beginning with empty line.
      input.gsub!(/<pre>(<code>)?\n?/, "<pre>\\1")

      replace(RDiscount.new(input).to_html)
    end

    # Shortens text if needed.
    #
    # 116 chars is also where ext-doc makes its cut, but unlike
    # ext-doc we only make the cut when there's more than 120 chars.
    #
    # This way we don't get stupid expansions like:
    #
    #   Blah blah blah some text...
    #
    # expanding to:
    #
    #   Blah blah blah some text.
    #
    # Ellipsis is only added when input actually gets shortened.
    def shorten(input)
      if too_long?(input)
        strip_tags(input)[0..(@max_length-4)] + "..."
      else
        input
      end
    end

    # Returns true when input should get shortened.
    def too_long?(input)
      strip_tags(input).length > @max_length
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end
  end

end
