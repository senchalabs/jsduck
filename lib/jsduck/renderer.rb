require 'cgi'

module JsDuck

  # Ruby-side implementation of class docs Renderer.
  # Uses PhantomJS to run Docs.Renderer JavaScript.
  class Renderer
    def initialize(options={})
      @options = options
    end

    def render(cls)
        @cls = cls

        return [
          "<div>",
            render_hierarchy,
            "<div class='doc-contents'>",
              render_private_class_notice,
              @cls[:doc],
              render_meta_data,
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

    def render_meta_data
      return if !@cls[:meta] || @cls[:meta].length == 0

      html = ["<ul class='meta-data'>"]

      @options[:meta_tags].each do |meta|
        title = meta[:title]
        items = @cls[:meta].find_all {|m| m[:name] == meta[:name]}.map {|m| m[:content] }
        content = meta[:strip] ? items.map {|m| m.gsub(meta[:strip], "") } : items
        if items.length > 0
          html << "<li><strong>#{CGI.escapeHTML(title)}:</strong> #{CGI.escapeHTML(content.join(', '))}</li>"
        end
      end

      html << "</ul>"

      html
    end

    def render_hierarchy
      has_parents = @cls[:extends] && @cls[:extends] != "Object"
      has_alt_names = @cls[:alternateClassNames].length > 0
      has_mixins = @cls[:superclasses].length > 0

      return if !has_parents && !has_alt_names && !has_mixins

      return [
        '<pre class="hierarchy">',
        render_alternate_class_names,
        render_tree,
        render_mixins,
        '</pre>'
      ]
    end

    def render_alternate_class_names
      return if @cls[:alternateClassNames].length == 0
      return [
        "<h4>Alternate names</h4>",
        @cls[:alternateClassNames].map {|name| "<div class='alternate-class-name'>#{name}</div>" },
      ]
    end

    def render_mixins
      return if @cls[:allMixins].length == 0
      return [
        "<h4>Mixins</h4>",
        @cls[:allMixins].map {|name| "<div class='mixin'>#{render_link(name)}</div>" },
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
            "<div id='m-#{sec[:type]}'>",
              statics.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
              "<h3 class='members-title'>#{sec[:title]}</h3>",
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
      # use classname "expandable" when member has shortened description
      expandable = m[:shortDoc] ? "expandable" : "not-expandable"
      # shorthand to owner class
      owner = m[:owner]
      # use classname "inherited" when member is not defined in this class
      inherited = owner == @cls[:name] ? "not-inherited" : "inherited"

      return [
        "<div id='#{m[:tagname]}-#{m[:name]}' class='member #{first_child} #{inherited}'>",
          # leftmost column: expand button
          "<a href='#' class='side #{expandable}'>",
            "<span>&nbsp;</span>",
          "</a>",
          # member name and type + link to owner class and source
          "<div class='title'>",
            "<div class='meta'>",
              "<a href='#!/api/#{owner}' rel='#{owner}' class='definedIn docClass'>#{owner}</a><br/>",
              "<a href='source/#{m[:href]}' target='_blank' class='viewSource'>view source</a>",
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
        before = "<strong class='constructor-signature'>new</strong>"
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
      if m[:protected]
        after += "<strong class='protected-signature'>protected</strong>"
      end
      if m[:static]
        after += "<strong class='static-signature'>static</strong>"
      end
      if m[:deprecated]
        after += "<strong class='deprecated-signature'>deprecated</strong>"
      end
      if m[:required]
        after += "<strong class='required-signature'>required</strong>"
      end
      if m[:template]
        after += "<strong class='template-signature'>template</strong>"
      end

      uri = "#!/api/#{m[:owner]}-#{m[:tagname]}-#{m[:name]}"

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

      if m[:deprecated]
        v = m[:deprecated][:version] ? "since " + m[:deprecated][:version] : ""
        doc << [
          "<div class='deprecated'>",
          "<p>This #{m[:tagname]} has been <strong>deprecated</strong> #{v}</p>",
          m[:deprecated][:text],
          "</div>",
        ]
      end

      if m[:template]
        doc << [
          "<div class='template'>",
          "<p>This is a template method. A hook into the functionality of this class.",
          "Feel free to override it in child classes.</p>",
          "</div>",
        ]
      end

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
