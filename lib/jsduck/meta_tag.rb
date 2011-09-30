module JsDuck

  # Abstract base class for all meta tag implementations.
  #
  # Child classes must define value for @name attribute.  They can
  # also provide @title, @hidden, and override #render method.
  class MetaTag
    # Name of the tag (required)
    attr_reader :name

    # Title to use when rendering the meta-tag info
    attr_reader :title

    # True to not render the meta tag at all
    attr_reader :hidden

    # Override this to transform the content of meta-tag in whichever
    # way desired.
    def transform(text)
      markdown(text)
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
