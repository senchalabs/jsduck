require 'rubygems'
require 'rdiscount'
require 'strscan'
require 'cgi'

module JsDuck

  # Formats doc-comments
  class DocFormatter
    # Template HTML that replaces {@link Class#member anchor text}.
    # Can contain placeholders:
    #
    # %c - full class name (e.g. "Ext.Panel")
    # %m - class member name prefixed with member type (e.g. "method-urlEncode")
    # %# - inserts "#" if member name present
    # %- - inserts "-" if member name present
    # %a - anchor text for link
    #
    # Default value: '<a href="%c%M">%a</a>'
    attr_accessor :link_tpl

    # Template HTML that replaces {@img URL alt text}
    # Can contain placeholders:
    #
    # %u - URL from @img tag (e.g. "some/path.png")
    # %a - alt text for image
    #
    # Default value: '<img src="%u" alt="%a"/>'
    attr_accessor :img_tpl

    # Sets up instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    attr_accessor :class_context

    # Sets up instance to work in context of particular doc object.
    # Used for error reporting.
    attr_accessor :doc_context

    # Maximum length for text that doesn't get shortened, defaults to 120
    attr_accessor :max_length

    # JsDuck::Relations for looking up class names.
    #
    # When auto-creating class links from CamelCased names found from
    # text, we check the relations object to see if a class with that
    # name actually exists.
    attr_accessor :relations

    def initialize
      @class_context = ""
      @doc_context = {}
      @max_length = 120
      @relations = {}
      @link_tpl = '<a href="%c%#%m">%a</a>'
      @img_tpl = '<img src="%u" alt="%a"/>'
      @link_re = /\{@link\s+(\S*?)(?:\s+(.+?))?\}/m
      @img_re = /\{@img\s+(\S*?)(?:\s+(.+?))?\}/m
    end

    # Replaces {@link} and {@img} tags, auto-generates links for
    # recognized classnames.
    #
    # Replaces {@link Class#member link text} in given string with
    # HTML from @link_tpl.
    #
    # Replaces {@img path/to/image.jpg Alt text} with HTML from @img_tpl.
    #
    # Additionally replaces strings recognized as ClassNames with
    # links to these classes.  So one doesn even need to use the @link
    # tag to create a link.
    def replace(input)
      s = StringScanner.new(input)
      out = ""
      while !s.eos? do
        if s.check(@link_re)
          out += replace_link_tag(s.scan(@link_re))
        elsif s.check(@img_re)
          out += replace_img_tag(s.scan(@img_re))
        elsif s.check(/\{/)
          out += s.scan(/\{/)
        else
          out += replace_class_names(s.scan(/[^{]+/))
        end
      end
      out
    end

    def replace_link_tag(input)
      input.sub(@link_re) do
        target = $1
        text = $2
        if target =~ /^(.*)#(.*)$/
          cls = $1.empty? ? @class_context : $1
          member = $2
        else
          cls = target
          member = false
        end

        # Construct link text
        if text
          text = text
        elsif member
          text = (cls == @class_context) ? member : (cls + "." + member)
        else
          text = cls
        end

        file = @doc_context[:filename]
        line = @doc_context[:linenr]
        if !@relations[cls]
          puts "Warning: #{file} line #{line} #{input} links to non-existing class."
          text
        elsif member && !get_member_type(cls, member)
          puts "Warning: #{file} line #{line} #{input} links to non-existing member."
          text
        else
          link(cls, member, text)
        end
      end
    end

    def replace_img_tag(input)
      input.sub(@img_re) { img($1, $2) }
    end

    def replace_class_names(input)
      input.gsub(/(\A|\s)([A-Z][A-Za-z0-9.]*[A-Za-z0-9])(?:(#)([A-Za-z0-9]+))?([.,]?(?:\s|\Z))/m) do
        before = $1
        cls = $2
        hash = $3
        method = $4
        after = $5

        if @relations[cls]
          label = method ? cls+"."+method : cls
          before + link(cls, method, label) + after
        else
          before + cls + (hash || "") + (method || "") + after
        end
      end
    end

    # applies the image template
    def img(url, alt_text)
      @img_tpl.gsub(/(%\w)/) do
        case $1
        when '%u'
          url
        when '%a'
          CGI.escapeHTML(alt_text||"")
        else
          $1
        end
      end
    end

    # applies the link template
    def link(cls, member, anchor_text)
      # prepend type name to member name
      member = member && (get_member_type(cls, member).to_s + "-" + member)

      @link_tpl.gsub(/(%[\w#-])/) do
        case $1
        when '%c'
          cls
        when '%m'
          member ? member : ""
        when '%#'
          member ? "#" : ""
        when '%-'
          member ? "-" : ""
        when '%a'
          CGI.escapeHTML(anchor_text||"")
        else
          $1
        end
      end
    end

    def get_member_type(cls, member)
      @relations[cls] && @relations[cls].member_type(member)
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
