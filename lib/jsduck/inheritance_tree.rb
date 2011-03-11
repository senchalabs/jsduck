module JsDuck

  # Creates the inheritance tree shown on class documentation page.
  class InheritanceTree
    def initialize(cls)
      @cls = cls
    end

    # Renders the tree using HTML <pre> element
    def to_html
      i = -1
      html = (@cls.superclasses + [@cls]).collect do |cls|
        i += 1
        make_indent(i) + make_link(cls)
      end.join("\n")

      return <<-EOHTML
        <div class="inheritance res-block">
          <pre class="res-block-inner">#{html}</pre>
        </div>
      EOHTML
    end

    def make_indent(level)
      if level > 0
        ("  " * level) + "<img src='resources/elbow-end.gif' alt=''>"
      else
        ""
      end
    end

    def make_link(cls)
      if cls == @cls
        cls.short_name
      else
        "<a href='output/#{cls.full_name}.html' ext:cls='#{cls.full_name}'>#{cls.short_name}</a>"
      end
    end
  end

end
