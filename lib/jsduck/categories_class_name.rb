
module JsDuck

  # Renders class names for class categories page.
  class CategoriesClassName
    def initialize(doc_formatter, relations={})
      @doc_formatter = doc_formatter
      @relations = relations
    end

    # Renders the class name as a link or plain text.
    #
    # For new classes appends a star behind class name.  For classes
    # with new members appends list n small stars behind class name
    # (reflecting the number of new members).
    def render(name)
      cls = @relations[name]
      if cls
        @doc_formatter.link(name, nil, name) + render_new_label(cls)
      else
        # expand Ti alias
        expanded_cls = name.sub(/^Ti\./, "Titanium.")
        if @relations[expanded_cls]
          @doc_formatter.link(expanded_cls, nil, name)
        else
          name
        end
      end
    end

    private

    # Adds small star to new classes in the current version.
    def render_new_label(cls)
      if cls[:meta][:new]
        "&nbsp;<span class='new-class' title='New class'>&#9733;</span>"
      else
        ""
      end
    end

  end

end
