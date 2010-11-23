module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    def initialize(cls)
      @cls = cls
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
      table("configs", "Config Options", "Config Options", @cls[:cfg].collect {|c| config_row(c) })
    end

    def config_row(cfg)
      table_row("config-row",
        "<a id='#{@cls.full_name}-#{cfg[:name]}'></a>" +
        "<b><a href='source/sample.html#cfg-#{@cls.full_name}-#{cfg[:name]}'>#{cfg[:name]}</a></b> : #{cfg[:type]}" +
        "<div class='mdesc'>#{cfg[:doc]}</div>"
      )
    end

    def properties
      table("props", "Public Properties", "Property", @cls[:property].collect {|p| property_row(p) })
    end

    def property_row(prop)
      table_row("property-row",
        "<a id='#{@cls.full_name}-#{prop[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{prop[:name]}'>#{prop[:name]}</a></b> : #{prop[:type]}" +
        "<div class='mdesc'>#{prop[:doc]}</div>"
      )
    end

    def methods
      table("methods", "Public Methods", "Method", @cls[:method].collect {|m| property_row(m) })
    end

    def method_row(method)
      table_row("method-row",
        "<a id='#{@cls.full_name}-#{method[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{method[:name]}'>#{method[:name]}</a></b>()" +
        " : " + (method[:return] ? method[:return][:type] : "void") +
        "<div class='mdesc'>#{method[:doc]}</div>"
      )
    end

    def events
      table("events", "Public Events", "Event", @cls[:event].collect {|e| event_row(e) })
    end

    def event_row(event)
      table_row("method-row",
        "<a id='#{@cls.full_name}-#{event[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{event[:name]}'>#{event[:name]}</a></b> : ()" +
        "<div class='mdesc'>#{event[:doc]}</div>"
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

    def table_row(className, contents)
      [
       "<tr class='#{className}'>",
         "<td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>",
         "<td class='sig'>#{contents}</td>",
         "<td class='msource'>#{@cls.short_name}</td>",
       "</tr>",
      ].join("")
    end
  end

end
