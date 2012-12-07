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
        name
      end
    end

    private

    # Adds small star to new classes in the current version.
    def render_new_label(cls)
      if cls[:meta][:new]
        "&nbsp;<span class='new-class' title='New class'>#{stars(1)}</span>"
      else
        n = new_members_count(cls)
        if n > 0
          title = "#{n} new member#{(n>1) ? 's' : ''}"
          "&nbsp;<span class='new-members' title='#{title}'>#{stars(n)}</span>"
        else
          ""
        end
      end
    end

    # Produces string of n stars.
    # First 3 stars are rendered as "<unicode-star>", the following as "+".
    # At max 15 stars are rendered.
    def stars(n)
      if n > 15
        stars(3) + ("+" * (15-3))
      elsif n > 3
        stars(3) + ("+" * (n-3))
      else
        "&#9733;" * n
      end
    end

    # Returns number of new members the class has in the current version
    def new_members_count(cls)
      cls.find_members(:local => true).find_all {|m| m[:meta][:new] && !m[:private] }.length
    end

  end

end
