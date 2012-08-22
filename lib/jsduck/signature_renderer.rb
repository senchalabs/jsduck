require 'jsduck/meta_tag_renderer'

module JsDuck

  # Performs the rendering of member signatures.
  class SignatureRenderer
    # Initializes the renderer for rendering members of the given
    # class.
    def initialize(cls)
      @cls = cls
    end

    # Renders signature of the given member.
    def render(member)
      # Keep the code simpler by not passing around the member hash
      @m = member

      return [
        render_new,
        render_link,
        render_type,
        render_meta,
      ]
    end

    private

    def render_new
      constructor? ? "<strong class='new-keyword'>new</strong>" : ""
    end

    def render_link
      "<a href='#{render_url}' class='name #{render_expandable}'>#{render_name}</a>"
    end

    def render_url
      "#!/api/#{@m[:owner]}-#{@m[:id]}"
    end

    def render_expandable
      @m[:shortDoc] ? "expandable" : "not-expandable"
    end

    def render_name
      constructor? ? @cls[:name] : @m[:name]
    end

    def constructor?
      @m[:tagname] == :method && @m[:name] == "constructor"
    end

    def render_type
      if like_property?
        render_property_type
      else
        render_params + render_return
      end
    end

    def like_property?
      @m[:tagname] == :cfg || @m[:tagname] == :property || @m[:tagname] == :css_var
    end

    def render_property_type
      "<span> : #{@m[:html_type]}</span>"
    end

    def render_params
      ps = @m[:params].map {|p| render_single_param(p) }.join(", ")
      "( <span class='pre'>#{ps}</span> )"
    end

    def render_single_param(param)
      param[:optional] ? "["+param[:name]+"]" : param[:name]
    end

    def render_return
      method_with_return? ? (" : " + @m[:return][:html_type]) : ""
    end

    def method_with_return?
      @m[:tagname] == :method && @m[:return][:type] != "undefined"
    end

    def render_meta
      MetaTagRenderer.render_signature(@m)
    end

  end

end
