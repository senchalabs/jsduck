module JsDuck

  # Generates HTML for the class hierarchy sidebar inside class
  # documentation.
  class Sidebar
    def initialize(opts)
      @opts = opts
    end

    # Renders a sidebar for given class.
    # Returns Array of HTML or nil.
    def render(cls)
      items = [
        render_alternate_class_names(cls[:alternateClassNames]),
        render_tree(cls),
        render_dependencies(cls[:mixins], "Mixins"),
        render_dependencies(cls[:parentMixins], "Inherited mixins"),
        render_dependencies(cls[:requires], "Requires"),
        render_dependencies(cls[:subclasses], "Subclasses"),
        render_dependencies(cls[:mixedInto], "Mixed into"),
        render_dependencies(cls[:uses], "Uses"),
        render_files(cls[:files])
      ]

      if items.compact.length > 0
        return ['<pre class="hierarchy">', items, '</pre>']
      else
        return nil
      end
    end

    private

    def render_alternate_class_names(names)
      return if names.length == 0

      return [
        "<h4>Alternate names</h4>",
        names.map {|name| "<div class='alternate-class-name'>#{name}</div>" },
      ]
    end

    def render_dependencies(names, title)
      return if !names || names.length == 0

      return [
        "<h4>#{title}</h4>",
        names.map {|name| "<div class='dependency'>#{name.exists? ? render_link(name) : name}</div>" },
      ]
    end

    def render_files(files)
      return if !@opts.source || files.length == 0 || files[0][:filename] == ""

      return [
        "<h4>Files</h4>",
        files.map do |file|
          url = "source/" + file[:href]
          title = File.basename(file[:filename])
          "<div class='dependency'><a href='#{url}' target='_blank'>#{title}</a></div>"
        end
      ]
    end

    # Take care of the special case where class has parent for which we have no docs.
    # In that case the "extends" property exists but "superclasses" is empty.
    # We still create the tree, but without links in it.
    def render_tree(cls)
      return if !cls[:extends] || cls[:extends] == "Object"

      return [
        "<h4>Hierarchy</h4>",
        render_class_tree(cls[:superclasses] + [cls[:name]])
      ]
    end

    def render_class_tree(classes, i=0)
      return "" if classes.length <= i

      name = classes[i]
      return [
        "<div class='subclass #{i == 0 ? 'first-child' : ''}'>",
          classes.length-1 == i ? "<strong>#{name}</strong>" : (name.exists? ? render_link(name) : name),
          render_class_tree(classes, i+1),
        "</div>",
      ]
    end

    def render_link(cls_name)
      "<a href='#!/api/#{cls_name}' rel='#{cls_name}' class='docClass'>#{cls_name}</a>"
    end

  end

end
