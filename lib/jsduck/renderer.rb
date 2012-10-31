require 'jsduck/meta_tag_registry'
require 'jsduck/html'

module JsDuck

  # Ruby-side implementation of class docs Renderer.
  # Uses PhantomJS to run Docs.Renderer JavaScript.
  class Renderer
    def initialize(opts)
      @opts = opts
    end

    def render(cls)
        @cls = cls

        return [
          "<div>",
          	"<div class='sidebar'>",
#            render_sidebar,
             @cls[:meta] != nil && @cls[:meta][:platform] != nil && @cls[:meta][:platform].length != 0 ? render_platforms(@cls[:meta][:platform], true) : '',
            "</div>",
            "<div class='hierarchy'>",
            render_tree,
            "</div>",
            "<div class='doc-contents'>",
              render_meta_data(@cls[:html_meta], :top),
              render_private_class_notice,
              @cls[:doc],
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

    def render_meta_data(meta_data, position)
      return if meta_data.size == 0

      MetaTagRegistry.instance.tags(position).map {|tag| meta_data[tag.key] }
    end

    def render_platforms(platforms, sidebar)
      mapping = {
		'android' => 'Android',
		'iphone' => 'iPhone',
		'ipad' => 'iPad',
		'mobileweb' => 'Mobile Web'
	  }

      return [
        '<ul class="',
        sidebar ? 'sidebar-platforms' : 'platforms',
        '">',
        platforms.map do |platform| 
        	begin
                name, version = platform.split()
	        	"<li class='platform-" + name + "' title='" + mapping[name] + " since Titanium SDK "+version+"'>" + (sidebar ? (mapping[name] + " "+ version)  : '&nbsp;') + "</li>" 
	        rescue
	    	    puts "[ERROR] Unknown platform: '" + platform + "'"
    	    end
        end,
        '</ul>'
      ]
    end

    def render_inline_platforms(platforms, sidebar)
      mapping = {
		'android' => 'Android',
		'iphone' => 'iPhone',
		'ipad' => 'iPad',
		'mobileweb' => 'Mobile Web'
	  }

      return [
        '<ul class="',
        sidebar ? 'sidebar-platforms' : 'platforms',
        '">',
        platforms.map do |platform| 
        	begin
	        	"<li class='platform-" + platform + "' title='" + mapping[platform]+"' >" + (sidebar ? (mapping[platform])  : '&nbsp;') + "</li>" 
	        rescue
	    	    puts "[ERROR] Unknown platform: '" + platform + "'"
    	    end
        end,
        '</ul>'
      ]
    end

    def render_sidebar
      items = [
        render_alternate_class_names,
#        render_tree,
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
        @cls[:alternateClassNames].sort.map {|name| "<div class='alternate-class-name'>#{name}</div>" },
      ]
    end

    def render_dependencies(type, title)
      return if !@cls[type] || @cls[type].length == 0
      return [
        "<h4>#{title}</h4>",
        @cls[type].sort.map {|name| "<div class='dependency'>#{name.exists? ? render_link(name) : name}</div>" },
      ]
    end

    def render_files
      # We don't need to output this section since we don't have real JS sources
      return 
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
    #
    # Restoring Ti versions of render_tree and render_class_tree
    #
    def render_tree
      return if !@cls[:extends] || @cls[:extends] == "Object"
      tree = ["<div class='classes'>"]#<h4>Hierarchy</h4>

      if @cls[:superclasses].length > 0
        tree + render_class_tree(@cls[:superclasses].concat([@cls[:name]]), {:first => true, :links =>        true}) + ["</div>"]
      else
        tree + render_class_tree([@cls[:extends], @cls[:name]], {:first => true}) + ["</div>"]
      end
      #tree + ["</div>"]

    end

    def render_class_tree(superclasses, o)
      return "" if superclasses.length == 0

      name = superclasses[0]
      # note render_class_tree was moved below the </div>. need to figure out whether
      # Andrew did this on purpose, or by accident.
      return [
        "<div class='subclass'>",
          (o[:first] ? '' : ' &gt; '),
          superclasses.length > 1 ? (o[:links] ? render_link(name) : name) : "<strong>#{name}</strong>",
        "</div>",
        render_class_tree(superclasses.slice(1, superclasses.length-1), {:links => o[:links]})
      ]
    end

#    def render_class_tree(classes, i=0)
#      return "" if classes.length <= i
#
#      name = classes[i]
#      return [
#        "<div class='subclass #{i == 0 ? 'first-child' : ''}'>",
#          classes.length-1 == i ? "<strong>#{name}</strong>" : (name.exists? ? render_link(name) : name),
#         render_class_tree(classes, i+1),
#        "</div>",
#      ]
#    end

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
      elsif m[:tagname] != :event
        ps = m[:params].map {|p| render_short_param(p) }.join(", ")
        params = "( <span class='pre'>#{ps}</span> )"
        if m[:tagname] == :method && m[:return][:type] != "undefined"
          params += " : " + m[:return][:html_type]
        end
      end

      after = ""
      MetaTagRegistry.instance.signatures.each do |s|
        after += "<strong class='#{s[:key]} signature'>#{s[:long]}</strong>" if m[:meta][s[:key]]
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
      doc = []

      doc << render_meta_data(m[:html_meta], :top)

      doc << m[:doc]

      if m[:default] && m[:default] != "undefined"
        doc << "Default: " + m[:default]
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
        if item[:type] == "Function" || item[:tagname] == :method
          doc << '<h3 class="pa">Parameters</h3>'
        elsif item[:tagname] == :event
          doc << '<h3 class="pa">Properties</h3>'
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
          p[:deprecated] ? '<strong class="deprecated signature">deprecated</strong>' : "",
          "<div class='sub-desc'>",
            p[:doc],
            p[:platform] != nil && p[:platform].length > 0 ? render_platforms(p[:platform], false) : '',
            p[:inline_platforms] != nil && p[:inline_platforms].length > 0 ?  render_inline_platforms(p[:inline_platforms], false) : '',
            p[:default] ? "Default: " + p[:default] : "",
            p[:properties] && p[:properties].length > 0 ? render_params_and_return(p) : "",
          "</div>",
        "</li>",
      ]
    end

    def render_return(ret)
      return ["<h3 class='pa'>Returns</h3><ul><li><span class='pre'>void</span></li></ul>"] if ret[:type] == "undefined"
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
