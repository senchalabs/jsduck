module JsDuck
  module Inline

    # Implementation of @example tag.
    #
    # Looks for @example tag at the beginning of code blocks. When
    # found, adds an "inline-example" CSS class to the <pre> element.
    #
    # Unlike other Inline:: classes this doesn't implement an
    # {@example} tag as could be expected.  But it fits nicely along
    # with other inline tags as it's processed inside DocFormatter, so
    # it mostly fits here along with the others.
    #
    class Example
      # Constructor takes opts parameter for consistency with other
      # JsDuck::Inline::* classes.
      def initialize(opts={})
        @re = /<pre><code>\s*@example( +[^\n]*)?\s+/m
      end

      # Takes StringScanner instance.
      #
      # Looks for "<pre><code>@example" at the current scan pointer
      # position, when found, moves scan pointer forward and performs
      # the apporpriate replacement.
      def replace(input)
        if input.check(@re)
          # Match possible classnames following @example and add them
          # as CSS classes inside <pre> element.
          input.scan(@re) =~ @re
          css_classes = ($1 || "").strip

          return "<pre class='inline-example #{css_classes}'><code>"
        else
          false
        end
      end

    end

  end
end
