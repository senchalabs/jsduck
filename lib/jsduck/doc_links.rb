module JsDuck

  # Detects {@link ...} tags in text and replaces them with HTML links
  # pointing to documentation.  In addition to the href attribute
  # links will also contain ext:cls and ext:member attributes.
  class DocLinks
    # Initializes instance to work in context of particular class, so
    # that when {@link #blah} is encountered it knows that
    # Context#blah is meant.
    def initialize(context)
      @context = context
    end

    # Replaces {@link Class#member link text} in given string with
    # HTML links.
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
  end

end
