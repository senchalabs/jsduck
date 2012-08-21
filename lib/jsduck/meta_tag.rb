module JsDuck

  # Abstract base class for all meta tag implementations.
  #
  # Child classes must define value for @name attribute.  They can
  # also provide @multiline, and override #to_html method.
  class MetaTag
    # Name of the tag (required)
    attr_reader :name

    # The key under which to store this tag. Must be a symbol.  When
    # not provided then :name is converted to symbol and used as key.
    attr_accessor :key

    # The text to display in member signature.  Must be a hash
    # defining the short and long versions of the signature text:
    #
    #     {:long => "something", :short => "SOM"}
    #
    # Additionally the hash can contain a :tooltip which is the text
    # to be shown when the signature bubble is hovered over in docs.
    attr_reader :signature

    # True to include all lines up to next @tag as part of this meta-tag
    attr_reader :multiline

    # True to ignore any text after the @tag, just record the
    # existance of the tag.
    attr_reader :boolean

    # Whether to render the tag before other content (:top) or after
    # it (:bottom).  Defaults to :bottom.
    attr_accessor :position

    # Here the appropriate class or member will be injected,
    # so the to_value and to_html methods can for produce
    # different output based on whether the tag is inside class,
    # method, event, etc.
    attr_accessor :context

    # Here the Assets object will be injected, so the Tag implementation
    # can access guides, videos, etc when he needs to.
    attr_accessor :assets

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
