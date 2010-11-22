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
      [
       "<a id='#{@cls.full_name}-configs'></a>",
       "<h2>Config Options</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>Config Options</th><th class='msource-header'>Defined By</th></tr>",
       @cls[:cfg].collect {|cfg| config_row(cfg) }.join("\n"),
       "</tbody></table>",
      ].join("\n")
    end

    def config_row(cfg)
      table_row("config-row",
        "<a id='#{@cls.full_name}-#{cfg[:name]}'></a>" +
        "<b><a href='source/sample.html#cfg-#{@cls.full_name}-#{cfg[:name]}'>#{cfg[:name]}</a></b> : #{cfg[:type]}" +
        "<div class='mdesc'>#{cfg[:doc]}</div>"
      )
    end

    def properties
      [
       "<a id='#{@cls.full_name}-props'></a>",
       "<h2>Public Properties</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>Property</th><th class='msource-header'>Defined By</th></tr>",
       @cls[:property].collect {|prop| property_row(prop) }.join("\n"),
       "</tbody></table>",
      ].join("\n")
    end

    def property_row(prop)
      table_row("property-row",
        "<a id='#{@cls.full_name}-#{prop[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{prop[:name]}'>#{prop[:name]}</a></b> : #{prop[:type]}" +
        "<div class='mdesc'>#{prop[:doc]}</div>"
      )
    end

    def methods
      [
       "<a id='#{@cls.full_name}-methods'></a>",
       "<h2>Public Methods</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>Method</th><th class='msource-header'>Defined By</th></tr>",
       @cls[:method].collect {|m| method_row(m) }.join("\n"),
       "</tbody></table>",
      ].join("\n")
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
      [
       "<a id='#{@cls.full_name}-events'></a>",
       "<h2>Public Events</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>Event</th><th class='msource-header'>Defined By</th></tr>",
       @cls[:event].collect {|m| event_row(m) }.join("\n"),
       "</tbody></table>",
      ].join("\n")
    end

    def event_row(event)
      table_row("method-row",
        "<a id='#{@cls.full_name}-#{event[:name]}'></a>" +
        "<b><a href='source/sample.html#prop-#{@cls.full_name}-#{event[:name]}'>#{event[:name]}</a></b> : ()" +
        "<div class='mdesc'>#{event[:doc]}</div>"
      )
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
