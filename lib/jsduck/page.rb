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
      "<div class='description'>#{@cls[:doc]}</div>"
    end

    def configs
      table("configs", "Config Options", "Config Options", @cls.members(:cfg).collect {|c| config_row(c) })
    end

    def config_row(cfg)
      table_row("config-row", cfg,
        "<a id='#{@cls.full_name}-#{cfg[:name]}'></a>" +
        "<b><a href='source/sample.html#cfg-#{@cls.full_name}-#{cfg[:name]}'>#{cfg[:name]}</a></b> : #{cfg[:type]}" +
        mdesc(cfg)
      )
    end

    def properties
      table("props", "Public Properties", "Property", @cls.members(:property).collect {|p| property_row(p) })
    end

    def property_row(prop)
      table_row("property-row", prop,
        "<a id='#{@cls.full_name}-#{prop[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{prop[:name]}'>#{prop[:name]}</a></b> : #{prop[:type]}" +
        mdesc(prop)
      )
    end

    def methods
      table("methods", "Public Methods", "Method", @cls.members(:method).collect {|m| method_row(m) })
    end

    def method_row(method)
      table_row("method-row", method,
        "<a id='#{@cls.full_name}-#{method[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{method[:name]}'>#{method[:name]}</a></b>()" +
        " : " + (method[:return] ? (method[:return][:type] || "void") : "void") +
        mdesc(method)
      )
    end

    def events
      table("events", "Public Events", "Event", @cls.members(:event).collect {|e| event_row(e) })
    end

    def event_row(event)
      table_row("method-row", event,
        "<a id='#{@cls.full_name}-#{event[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{event[:name]}'>#{event[:name]}</a></b> : ()" +
        mdesc(event)
      )
    end

    def mdesc(item)
      "<div class='mdesc'>" + expandable_desc(@links.replace(item[:doc])) + "</div>"
    end

    def expandable_class(item)
      expandable?(item[:doc]) ? "expandable" : ""
    end

    def expandable_desc(doc)
      expandable?(doc) ? "<div class='short'>#{doc[0..117]}...</div><div class='long'>#{doc}</div>" : doc
    end

    def expandable?(doc)
      doc.length > 120
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

    def table_row(className, item, contents)
      [
       "<tr class='#{className} #{expandable_class(item)}'>",
         "<td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>",
         "<td class='sig'>#{contents}</td>",
         "<td class='msource'>#{Class.short_name(item[:member])}</td>",
       "</tr>",
      ].join("")
    end
  end

end
