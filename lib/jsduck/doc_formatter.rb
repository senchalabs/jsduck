require 'rubygems'
require 'rdiscount'

module JsDuck

  # Formats doc-comments
  class DocFormatter
    # CSS class to add to each link
    attr_accessor :cssClass

    # Template for the href URL.
    # Can contain %cls% which is replaced with actual classname.
    # Also '#' and member name is appended to link if needed
    attr_accessor :urlTemplate

    # Sets up instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    attr_accessor :context

    def initialize
      @context = ""
      @cssClass = nil
      @urlTemplate = "%cls%"
    end

    # Replaces {@link Class#member link text} in given string with
    # HTML links pointing to documentation.  In addition to the href
    # attribute links will also contain ext:cls and ext:member
    # attributes.
    def replace(input)
      input.gsub(/\{@link +(\S*?)(?: +(.+?))?\}/) do
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
      url = @urlTemplate.sub(/%cls%/, cls) + anchor
      href = ' href="' + url + '"'
      rel = ' rel="' + cls + anchor + '"'
      cssCls = @cssClass ? ' class="' + @cssClass + '"' : ''
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

  end

end
