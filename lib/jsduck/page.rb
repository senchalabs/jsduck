module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    def initialize(cls)
      @cls = cls
      @links = DocLinks.new(cls.full_name)
    end

    def to_html
      [
       '<div xmlns:ext="http://www.extjs.com" class="body-wrap">',
       heading,
       abstract,
       description,
       "<div class='hr'></div>",
       configs,
       properties,
       methods,
       events,
       "</div>",
      ].join("\n")
    end

    def heading
      "<h1>Class <a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
       abstract_row("Package:", @cls.package_name),
       abstract_row("Defined In:", "sample.js"),
       abstract_row("Class:", "<a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.short_name}</a>"),
       abstract_row("Extends:", @cls[:extends] || "Object"),
       "</table>",
      ].join("\n")
    end

    def abstract_row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@links.replace(@cls[:doc])}</div>"
    end

    def configs
      table("configs", "Config Options", "Config Options", @cls.members(:cfg).collect {|c| config_row(c) })
    end

    def config_row(cfg)
      table_row("config-row", cfg,
        "<a id='#{@cls.full_name}-#{cfg[:name]}'></a>" +
        "<b><a href='source/sample.html#cfg-#{@cls.full_name}-#{cfg[:name]}'>#{cfg[:name]}</a></b> : #{cfg[:type]}",
        cfg[:doc]
      )
    end

    def properties
      table("props", "Public Properties", "Property", @cls.members(:property).collect {|p| property_row(p) })
    end

    def property_row(prop)
      table_row("property-row", prop,
        "<a id='#{@cls.full_name}-#{prop[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{prop[:name]}'>#{prop[:name]}</a></b> : #{prop[:type]}",
        prop[:doc]
      )
    end

    def methods
      table("methods", "Public Methods", "Method", @cls.members(:method).collect {|m| method_row(m) })
    end

    def method_row(method)
      table_row("method-row", method,
        "<a id='#{@cls.full_name}-#{method[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{method[:name]}'>#{method[:name]}</a></b>()" +
        " : " + (method[:return] ? (method[:return][:type] || "void") : "void"),
        method[:doc]
      )
    end

    def events
      table("events", "Public Events", "Event", @cls.members(:event).collect {|e| event_row(e) })
    end

    def event_row(event)
      table_row("method-row", event,
        "<a id='#{@cls.full_name}-#{event[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{event[:name]}'>#{event[:name]}</a></b> : ()",
        event[:doc]
      )
    end

    def table(idSuffix, title, columnTitle, rows)
      # When no rows to show, create no table whatsoever
      return "" if rows.length == 0

      [
       "<a id='#{@cls.full_name}-#{idSuffix}'></a>",
       "<h2>#{title}</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>#{columnTitle}</th><th class='msource-header'>Defined By</th></tr>",
       rows.join("\n"),
       "</tbody></table>",
      ].join("\n")
    end

    def table_row(className, item, signature, contents)
      contents = @links.replace(contents)
      [
       "<tr class='#{className} #{expandable?(contents) ? 'expandable' : ''}'>",
         "<td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>",
         "<td class='sig'>#{signature}<div class='mdesc'>#{expandable_desc(contents)}</div></td>",
         "<td class='msource'>#{Class.short_name(item[:member])}</td>",
       "</tr>",
      ].join("")
    end

    # 116 chars is also where ext-doc makes its cut, but unlike
    # ext-doc we only make the cut when there's more than 120 chars.
    #
    # This way we don't get stupid expansions like:
    #
    #   Blah blah blah some text...
    #
    # expanding to:
    #
    #   Blah blah blah some text.
    #
    def expandable_desc(doc)
      expandable?(doc) ? "<div class='short'>#{strip_tags(doc)[0..116]}...</div><div class='long'>#{doc}</div>" : doc
    end

    def expandable?(doc)
      strip_tags(doc).length > 120
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end

  end

end
