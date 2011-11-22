require 'cgi'

module JsDuck

  # Ruby-side implementation of class docs Renderer.
  # Uses PhantomJS to run Docs.Renderer JavaScript.
  class Renderer
    # List of meta-tag implementations
    attr_accessor :meta_tags

    def render(cls)
        @cls = cls

        return [
          "<div>",
            render_sidebar,
            "<div class='doc-contents'>",
              render_private_class_notice,
              @cls[:doc],
              render_meta_data(@cls[:meta]),
            "</div>",
            "<div class='members'>",
              render_member_sections,
            "</div>",
          "</div>",
        ].flatten.compact.join
    end

    def render_private_class_notice
      return if !@cls[:private]
      return [
        "<p class='private'><strong>NOTE</strong> ",
        "This is a private utility class for internal use by the framework. ",
        "Don't rely on its existence.</p>",
      ]
    end

    def render_meta_data(meta_data)
      return if meta_data.size == 0

      @meta_tags.map do |tag|
        contents = meta_data[tag.name]
        if contents
          tag.to_html(contents)
        else
          nil
        end
      end
    end

    def render_sidebar
      items = [
        render_alternate_class_names,
        render_tree,
        render_dependencies(:allMixins, "Mixins"),
        render_dependencies(:requires, "Requires"),
        render_dependencies(:uses, "Uses"),
        render_files,
      ]
      if items.compact.length > 0
        return ['<pre class="hierarchy">', items, '</pre>']
      else
        return nil
      end
    end

    def render_alternate_class_names
      return if @cls[:alternateClassNames].length == 0
      return [
        "<h4>Alternate names</h4>",
        @cls[:alternateClassNames].map {|name| "<div class='alternate-class-name'>#{name}</div>" },
      ]
    end

    def render_dependencies(type, title)
      return if !@cls[type] || @cls[type].length == 0
      return [
        "<h4>#{title}</h4>",
        @cls[type].map {|name| "<div class='dependency'>#{render_link(name)}</div>" },
      ]
    end

    def render_files
      return if @cls[:files].length == 0 || @cls[:files][0][:filename] == ""
      return [
        "<h4>Files</h4>",
        @cls[:files].map do |file|
          url = "source/" + file[:href]
          title = File.basename(file[:filename])
          "<div class='dependency'><a href='#{url}' target='_blank'>#{title}</a></div>"
        end
      ]
    end

    # Take care of the special case where class has parent for which we have no docs.
    # In that case the "extends" property exists but "superclasses" is empty.
    # We still create the tree, but without links in it.
    def render_tree
      return if !@cls[:extends] || @cls[:extends] == "Object"
      tree = ["<h4>Hierarchy</h4>"]

      if @cls[:superclasses].length > 0
        tree + render_class_tree(@cls[:superclasses].concat([@cls[:name]]), {:first => true, :links => true})
      else
        tree + render_class_tree([@cls[:extends], @cls[:name]], {:first => true})
      end
    end

    def render_class_tree(superclasses, o)
      return "" if superclasses.length == 0

      name = superclasses[0]
      return [
        "<div class='subclass #{o[:first] ? 'first-child' : ''}'>",
          superclasses.length > 1 ? (o[:links] ? render_link(name) : name) : "<strong>#{name}</strong>",
          render_class_tree(superclasses.slice(1, superclasses.length-1), {:links => o[:links]}),
        "</div>",
      ]
    end

    def render_link(cls_name)
        return "<a href='#!/api/#{cls_name}' rel='#{cls_name}' class='docClass'>#{cls_name}</a>"
    end

    def render_member_sections
      sections = [
        {:type => :cfg, :title => "Config options"},
        {:type => :property, :title => "Properties"},
        {:type => :method, :title => "Methods"},
        {:type => :event, :title => "Events"},
        {:type => :css_var, :title => "CSS Variables"},
        {:type => :css_mixin, :title => "CSS Mixins"},
      ]

      # Skip rendering empty sections
      sections.map do |sec|
        members = @cls[:members][sec[:type]]
        statics = @cls[:statics][sec[:type]]
        if members.length > 0 || statics.length > 0
          [
            "<div class='members-section'>",
              statics.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
              "<h3 class='members-title icon-#{sec[:type]}'>#{sec[:title]}</h3>",
              render_subsection(members, statics.length > 0 ? "Instance #{sec[:title]}" : nil),
              render_subsection(statics, "Static #{sec[:title]}"),
            "</div>",
          ]
        else
          nil
        end
      end
    end

    def render_subsection(members, title)
      return if members.length == 0
      index = 0
      return [
        "<div class='subsection'>",
          title ? "<div class='definedBy'>Defined By</div><h4 class='members-subtitle'>#{title}</h3>" : "",
          members.map {|m| index += 1; render_member(m, index == 1) },
        "</div>",
      ]
    end

    def render_member(m, is_first)
      # use classname "first-child" when it's first member in its category
      first_child = is_first ? "first-child" : ""
      # shorthand to owner class
      owner = m[:owner]
      # is this method inherited from parent?
      inherited = (owner != @cls[:name])

      return [
        "<div id='#{m[:id]}' class='member #{first_child} #{inherited ? 'inherited' : 'not-inherited'}'>",
          # leftmost column: expand button
          "<a href='#' class='side expandable'>",
            "<span>&nbsp;</span>",
          "</a>",
          # member name and type + link to owner class and source
          "<div class='title'>",
            "<div class='meta'>",
              inherited ? "<a href='#!/api/#{owner}' rel='#{owner}' class='defined-in docClass'>#{owner}</a>" :
                          "<span class='defined-in' rel='#{owner}'>#{owner}</span>",
              "<br/>",
              "<a href='source/#{m[:files][0][:href]}' target='_blank' class='view-source'>view source</a>",
            "</div>",
            # method params signature or property type signature
            render_signature(m),
          "</div>",
          # short and long descriptions
          "<div class='description'>",
            "<div class='short'>",
              m[:shortDoc] ? m[:shortDoc] : m[:doc],
            "</div>",
            "<div class='long'>",
              render_long_doc(m),
            "</div>",
          "</div>",
        "</div>",
      ]
    end

    def render_signature(m)
      expandable = m[:shortDoc] ? "expandable" : "not-expandable"

      name = m[:name]
      before = ""
      if m[:tagname] == :method && m[:name] == "constructor"
        before = "<strong class='new-keyword'>new</strong>"
        name = @cls[:name]
      end

      if m[:tagname] == :cfg || m[:tagname] == :property || m[:tagname] == :css_var
        params = "<span> : #{m[:html_type]}</span>"
      else
        ps = m[:params].map {|p| render_short_param(p) }.join(", ")
        params = "( <span class='pre'>#{ps}</span> )"
        if m[:tagname] == :method && m[:return][:type] != "undefined"
          params += " : " + m[:return][:html_type]
        end
      end

      after = ""
      if m[:attributes][:protected]
        after += "<strong class='protected signature'>protected</strong>"
      end
      if m[:attributes][:static]
        after += "<strong class='static signature'>static</strong>"
      end
      if m[:attributes][:deprecated]
        after += "<strong class='deprecated signature'>deprecated</strong>"
      end
      if m[:attributes][:required]
        after += "<strong class='required signature'>required</strong>"
      end
      if m[:attributes][:template]
        after += "<strong class='template signature'>template</strong>"
      end
      if m[:attributes][:abstract]
        after += "<strong class='abstract signature'>abstract</strong>"
      end
      if m[:attributes][:readonly]
        after += "<strong class='readonly signature'>readonly</strong>"
      end

      uri = "#!/api/#{m[:owner]}-#{m[:id]}"

      return [
        before,
        "<a href='#{uri}' class='name #{expandable}'>#{name}</a>",
        params,
        after
      ]
    end

    def render_short_param(param)
      p = param[:html_type] + " " + param[:name]
      return param[:optional] ? "["+p+"]" : p
    end

    def render_long_doc(m)
      doc = [m[:doc]]

      if m[:default] && m[:default] != "undefined"
        doc << "<p>Defaults to: <code>" + CGI.escapeHTML(m[:default]) + "</code></p>"
      end

      if m[:attributes][:deprecated]
        depr = m[:attributes][:deprecated]
        v = depr[:version] ? "since " + depr[:version] : ""
        doc << [
          "<div class='signature-box deprecated'>",
          "<p>This #{m[:tagname]} has been <strong>deprecated</strong> #{v}</p>",
          depr[:text],
          "</div>",
        ]
      end

      if m[:attributes][:template]
        doc << [
          "<div class='signature-box template'>",
          "<p>This is a template method. A hook into the functionality of this class.",
          "Feel free to override it in child classes.</p>",
          "</div>",
        ]
      end

      doc << render_meta_data(m[:meta])

      doc << render_params_and_return(m)

      doc
    end

    # Handles both rendering of method parameters and return value.
    # Plus the rendering of object properties, which could also be
    # functions in which case they too will be rendered with
    # parameters and return value.
    def render_params_and_return(item)
      doc = []

      if item[:params] && item[:params].length > 0
        params = item[:params]
      elsif item[:properties] && item[:properties].length > 0
        params = item[:properties]
        # If the name of last property is "return"
        # remove it from params list and handle it separately afterwards
        if params.last[:name] == "return"
          ret = params.last
          params = params.slice(0, params.length-1)
        end
      end

      if params
        if item[:type] == "Function" || item[:tagname] == :method || item[:tagname] == :event
          doc << '<h3 class="pa">Parameters</h3>'
        end
        doc << [
          "<ul>",
          params.map {|p| render_long_param(p) },
          "</ul>",
        ]
      end

      if item[:return]
        doc << render_return(item[:return])
      elsif ret
        doc << render_return(ret)
      end

      doc
    end

    def render_long_param(p)
      return [
        "<li>",
          "<span class='pre'>#{p[:name]}</span> : ",
          p[:html_type],
          p[:optional] ? " (optional)" : "",
          "<div class='sub-desc'>",
            p[:doc],
            p[:default] ? "<p>Defaults to: <code>#{CGI.escapeHTML(p[:default])}</code></p>" : "",
            p[:properties] && p[:properties].length > 0 ? render_params_and_return(p) : "",
          "</div>",
        "</li>",
      ]
    end

    def render_return(ret)
      return if ret[:type] == "undefined"
      return [
        "<h3 class='pa'>Returns</h3>",
        "<ul>",
          "<li>",
            "<span class='pre'>#{ret[:html_type]}</span>",
            "<div class='sub-desc'>",
              ret[:doc],
              ret[:properties] && ret[:properties].length > 0 ? render_params_and_return(ret) : "",
            "</div>",
          "</li>",
        "</ul>",
      ]
    end
  end

end
