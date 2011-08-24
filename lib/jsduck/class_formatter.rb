module JsDuck

  # Converts :doc properties of class from markdown to HTML and resolves @links.
  # Also removes private members.
  class ClassFormatter
    def initialize(relations, formatter)
      @relations = relations
      @formatter = formatter
    end

    # Runs the formatter on doc object of a class.
    # Accessed using Class#internal_doc
    def format(cls)
      @formatter.class_context = cls[:name]
      @formatter.doc_context = cls
      cls[:doc] = @formatter.format(cls[:doc]) if cls[:doc]
      cls[:members].each_pair do |type, members|
        cls[:members][type] = members.reject {|m| m[:private] }.map {|m| format_member(m) }
      end
      cls[:statics].each_pair do |type, members|
        cls[:statics][type] = members.reject {|m| m[:private] }.map {|m| format_member(m) }
      end
      cls
    end

    def format_member(m)
      @formatter.doc_context = m
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
      m[:deprecated][:text] = @formatter.format(m[:deprecated][:text]) if m[:deprecated]
      if m[:params] || (m[:properties] && m[:properties].length > 0) || m[:default] || @formatter.too_long?(m[:doc])
        m[:shortDoc] = @formatter.shorten(m[:doc])
      end
      m[:params] = format_params(m[:params]) if m[:params]
      m[:return] = format_return(m[:return]) if m[:return]
      m[:properties] = format_subproperties(m[:properties]) if m[:properties]
      m
    end

    def format_params(params)
      params.map do |p|
        p[:doc] = @formatter.format(p[:doc]) if p[:doc]
        p[:properties] = format_subproperties(p[:properties]) if p[:properties]
        p
      end
    end

    def format_return(r)
      r[:doc] = @formatter.format(r[:doc]) if r[:doc]
      r[:properties] = format_subproperties(r[:properties]) if r[:properties]
      r
    end

    def format_subproperties(items)
      items.map do |it|
        it[:doc] = @formatter.format(it[:doc]) if it[:doc]
        it[:properties] = format_subproperties(it[:properties]) if it[:properties]
        it
      end
    end

  end

end
