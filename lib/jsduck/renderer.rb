require 'jsduck/util/html'
require 'jsduck/meta_tag_renderer'
require 'jsduck/signature_renderer'

module JsDuck

  # Ruby-side implementation of class docs Renderer.
  # Uses PhantomJS to run Docs.Renderer JavaScript.
  class Renderer
    def initialize(opts)
      @opts = opts
    end

    def render(cls)
        @cls = cls
        @signature = SignatureRenderer.new(cls)

        return [
          "<div>",
            render_sidebar,
            "<div class='doc-contents'>",
              render_meta_data(@cls[:html_meta], :top),
              render_private_class_notice,
              @cls[:doc],
              render_enum_class_notice,
              render_meta_data(@cls[:html_meta], :bottom),
            "</div>",
            "<div class='members'>",
              render_all_sections,
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

    def render_enum_class_notice
      return if !@cls[:enum]

      if @cls[:enum][:doc_only]
        first = @cls[:members][:property][0] || {:name => 'foo', :default => '"foo"'}
        [
          "<p class='enum'><strong>ENUM:</strong> ",
          "This enumeration defines a set of String values. ",
          "It exists primarily for documentation purposes - ",
          "in code use the actual string values like #{first[:default]}, ",
          "don't reference them through this class like #{@cls[:name]}.#{first[:name]}.</p>",
        ]
      else
        [
          "<p class='enum'><strong>ENUM:</strong> ",
          "This enumeration defines a set of #{@cls[:enum][:type]} values.</p>",
        ]
      end
    end

    def render_meta_data(meta_data, position)
      MetaTagRenderer.render(meta_data, position)
    end

    def render_sidebar
      items = [
        render_alternate_class_names,
        render_tree,
        render_dependencies(:mixins, "Mixins"),
        render_dependencies(:parentMixins, "Inherited mixins"),
        render_dependencies(:requires, "Requires"),
        render_dependencies(:subclasses, "Subclasses"),
        render_dependencies(:mixedInto, "Mixed into"),
        render_dependencies(:uses, "Uses"),
        @opts.source ? render_files : nil,
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
        @cls[type].map {|name| "<div class='dependency'>#{name.exists? ? render_link(name) : name}</div>" },
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

      return [
        "<h4>Hierarchy</h4>",
        render_class_tree(@cls[:superclasses] + [@cls[:name]])
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

    def render_link(cls_name, member=nil)
      id = member ? cls_name + "-" + member[:id] : cls_name
      label = member ? cls_name + "." + member[:name] : cls_name
      return "<a href='#!/api/#{id}' rel='#{id}' class='docClass'>#{label}</a>"
    end

    def render_all_sections
      sections = [
        {:type => :property, :title => "Properties"},
        {:type => :method, :title => "Methods"},
        {:type => :event, :title => "Events"},
        {:type => :css_var, :title => "CSS Variables"},
        {:type => :css_mixin, :title => "CSS Mixins"},
      ]

      render_configs_section + sections.map {|sec| render_section(sec) }
    end

    def render_configs_section
      configs = @cls[:members][:cfg] + @cls[:statics][:cfg]

      if configs.length > 0
        required, optional = configs.partition {|c| c[:meta][:required] }
        return [
          "<div class='members-section'>",
            required.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
            "<h3 class='members-title icon-cfg'>Config options</h3>",
            render_subsection(required, "Required Config options"),
            render_subsection(optional, required.length > 0 ? "Optional Config options" : nil),
          "</div>",
        ]
      else
        return []
      end
    end

    def render_section(sec)
      members = @cls[:members][sec[:type]]
      statics = @cls[:statics][sec[:type]]

      # Skip rendering empty sections
      if members.length > 0 || statics.length > 0
        return [
          "<div class='members-section'>",
            statics.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
            "<h3 class='members-title icon-#{sec[:type]}'>#{sec[:title]}</h3>",
            render_subsection(members, statics.length > 0 ? "Instance #{sec[:title]}" : nil),
            render_subsection(statics, "Static #{sec[:title]}"),
          "</div>",
        ]
      else
        return []
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
              @opts.source ? "<a href='source/#{m[:files][0][:href]}' target='_blank' class='view-source'>view source</a>" : "",
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
      @signature.render(m)
    end

    def render_long_doc(m)
      doc = []

      doc << render_meta_data(m[:html_meta], :top)

      doc << m[:doc]

      if m[:default] && m[:default] != "undefined"
        doc << "<p>Defaults to: <code>" + Util::HTML.escape(m[:default]) + "</code></p>"
      end

      doc << render_meta_data(m[:html_meta], :bottom)

      doc << render_params_and_return(m)

      if m[:overrides]
        overrides = m[:overrides].map {|o| render_link(o[:owner], o) }.join(", ")
        doc << "<p>Overrides: #{overrides}</p>"
      end

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

      if item[:throws]
        doc << render_throws(item[:throws])
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
            p[:default] ? "<p>Defaults to: <code>#{Util::HTML.escape(p[:default])}</code></p>" : "",
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

    def render_throws(throws)
      return [
        "<h3 class='pa'>Throws</h3>",
        "<ul>",
          throws.map do |thr|
            [
              "<li>",
                "<span class='pre'>#{thr[:html_type]}</span>",
                "<div class='sub-desc'>#{thr[:doc]}</div>",
              "</li>",
            ]
          end,
        "</ul>",
      ]
    end
  end

end
