module JsDuck

  # Abstract base class for all meta tag implementations.
  #
  # Child classes must define value for @name attribute.  They can
  # also provide @multiline, and override #to_html method.
  class MetaTag
    # Name of the tag (required)
    attr_reader :name

    # True to include all lines up to next @tag as part of this meta-tag
    attr_reader :multiline

    # Override this to transform the content of meta-tag to HTML to be
    # included into documentation.
    #
    # It gets passed an array of contents gathered from all meta-tags
    # of given type. It should return an HTML string to inject into
    # document.  For help in that it can use the #markdown method to
    # easily support markdown inside the meta-tag.
    #
    # By default the method returns nil, which means the tag will not
    # be rendered at all.
    def to_html(contents)
    end

    # This is used to inject the formatter object for #markdown method
    attr_accessor :formatter

    # Helper method to format the text
    def markdown(text)
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
