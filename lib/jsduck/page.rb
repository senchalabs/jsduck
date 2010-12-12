require 'jsduck/doc_formatter'
require 'jsduck/cfg_table'
require 'jsduck/property_table'
require 'jsduck/method_table'
require 'jsduck/event_table'

module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    def initialize(cls)
      @cls = cls
      @formatter = DocFormatter.new(cls.full_name)
    end

    def to_html
      [
       '<div xmlns:ext="http://www.extjs.com" class="body-wrap">',
       heading,
       abstract,
       description,
       "<div class='hr'></div>",
       CfgTable.new(@cls).to_html,
       PropertyTable.new(@cls).to_html,
       MethodTable.new(@cls).to_html,
       EventTable.new(@cls).to_html,
       "</div>",
      ].join("\n")
    end

    def heading
      "<h1>Class <a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
        abstract_row("Extends:", @cls.parent ? class_link(@cls.parent.full_name) : "Object"),
       "</table>",
      ].join("\n")
    end

    def class_link(name)
      "<a href='output/#{name}.html' ext:cls='#{name}'>#{name}</a>"
    end

    def abstract_row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@formatter.format(@cls[:doc])}</div>"
    end
  end

end
