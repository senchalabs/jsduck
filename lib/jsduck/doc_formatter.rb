require 'rubygems'
require 'rdiscount'

module JsDuck

  # Formats doc-comments
  class DocFormatter
    # Initializes instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    def initialize(context)
      @context = context
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

        # Construct link attributes
        href = " href=\"output/#{cls}.html" + (member ? "#" + cls + "-" + member : "") + '"'
        ext_cls = ' ext:cls="' + cls + '"'
        ext_member = member ? ' ext:member="' + member + '"' : ""

        # Construct link text
        if text
          text = text
        elsif member
          text = (cls == @context) ? member : (cls + "." + member)
        else
          text = cls
        end

        "<a" + href + ext_cls + ext_member + ">" + text + "</a>"
      end
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
