module JsDuck

  # Abstract base class for all meta tag implementations.
  #
  # Child classes must define value for @name attribute.  They can
  # also provide @multiline, and override #to_html method.
  class MetaTag
    # Name of the tag (required)
    attr_reader :name

    # The key under which to store this tag. Should be a symbol.
    # By default the string :name is used as key.
    attr_reader :key

    # The text to display in member signature.  Must be a hash
    # defining the short and long versions of the signature text:
    #
    #     {:long => "something", :short => "SOM"}
    #
    attr_reader :signature

    # True to include all lines up to next @tag as part of this meta-tag
    attr_reader :multiline

    # True to ignore any text after the @tag, just record the
    # existance of the tag.
    attr_reader :boolean

    # It gets passed an array of contents gathered from all meta-tags
    # of given type. It should return the value to be stored for this
    # meta-tag at :key. The returned value is also passed to #to_html
    # method. Returning nil will cause the tag to be ignored. By
    # default the contents are returned unchanged.
    def to_value(contents)
      contents
    end

    # Override this to transform the content of meta-tag to HTML to be
    # included into documentation.
    #
    # It gets passed the value returned by #to_value method. It should
    # return an HTML string to inject into document.  For help in that
    # it can use the #format method to easily support Markdown and
    # {@link/img} tags inside the contents of meta-tag.
    #
    # By default the method returns nil, which means the tag will not
    # be rendered at all.
    def to_html(contents)
    end

    # This is used to inject the formatter object for #markdown method
    attr_accessor :formatter

    # Helper method to format the text in standard JsDuck way.
    # This means running it through Markdown engine and expanding
    # {@link} and {@img} tags.
    def format(text)
      @formatter.format(text)
    end

    # Returns all descendants of MetaTag class.
    def self.descendants
      result = []
      ObjectSpace.each_object(::Class) do |cls|
        result << cls if cls < self
      end
      result
    end

  end

end
