require 'jsduck/doc_formatter'
require 'jsduck/inheritance_tree'
require 'jsduck/cfg_table'
require 'jsduck/property_table'
require 'jsduck/method_table'
require 'jsduck/event_table'

module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    def initialize(cls, subclasses = {})
      @cls = cls
      @subclasses = subclasses
      @formatter = DocFormatter.new(cls.full_name)
    end

    def to_html
      [
       '<div class="body-wrap">',
       inheritance_tree,
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

    # only render the tree if class has at least one ancestor
    def inheritance_tree
      @cls.parent ? InheritanceTree.new(@cls).to_html : ""
    end

    def heading
      "<h1>Class <a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
        abstract_row("Extends:", @cls.parent ? class_link(@cls.parent.full_name) : "Object"),
        abstract_row("Defind In:", file_link),
        @subclasses[@cls] ? abstract_row("Subclasses:", subclasses) : "",
       "</table>",
      ].join("\n")
    end

    def class_link(class_name, label=nil)
      label = label || class_name
      "<a href='output/#{class_name}.html' ext:cls='#{class_name}'>#{label}</a>"
    end

    def file_link
      "<a href='source/#{@cls[:href]}'>#{@cls[:filename]}</a>"
    end

    def subclasses
      subs = @subclasses[@cls].sort {|a, b| a.short_name <=> b.short_name }
      subs.collect {|cls| class_link(cls.full_name, cls.short_name) }.join(", ")
    end

    def abstract_row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@formatter.format(@cls[:doc])}</div>"
    end
  end

end
