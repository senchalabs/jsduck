require 'cgi'
require 'jsduck/doc_formatter'
require 'jsduck/inheritance_tree'
require 'jsduck/cfg_table'
require 'jsduck/property_table'
require 'jsduck/method_table'
require 'jsduck/event_table'

module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    # Initializes doc page generator
    #
    # - cls : the Class object for which to generate documentation
    # - relations : access to subclasses, mixins, etc
    # - cache : cache for already generated HTML rows for class members
    #
    def initialize(cls, relations, cache = {})
      @cls = cls
      @relations = relations
      @cache = cache
      @formatter = DocFormatter.new
      @formatter.context = cls.full_name
      @formatter.css_class = 'docClass'
      @formatter.url_template = 'output/%cls%.html'
      @formatter.relations = relations
    end

    def to_html
      [
       '<div class="body-wrap">',
       inheritance_tree,
       heading,
       abstract,
       description,
       "<div class='hr'></div>",
       CfgTable.new(@cls, @formatter, @cache).to_html,
       PropertyTable.new(@cls, @formatter, @cache).to_html,
       MethodTable.new(@cls, @formatter, @cache).to_html,
       EventTable.new(@cls, @formatter, @cache).to_html,
       "</div>",
      ].join("\n")
    end

    # only render the tree if class has at least one ancestor
    def inheritance_tree
      @cls.parent ? InheritanceTree.new(@cls, @formatter).to_html : ""
    end

    def heading
      "<h1>Class <a href='source/#{@cls[:href]}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
        row("Extends:", extends_link),
        classes_row("Mixins:", @cls.mixins),
        row("Defind In:", file_link),
        classes_row("Subclasses:", @relations.subclasses(@cls)),
        classes_row("Mixed into:", @relations.mixed_into(@cls)),
        boolean_row("xtype:", @cls[:xtype]),
        boolean_row("Author:", @cls[:author]),
        boolean_row("Author of docs:", @cls[:docauthor]),
       "</table>",
      ].join("\n")
    end

    def class_link(class_name, label=nil)
      label = label || class_name
      @formatter.link(class_name, nil, label || class_name)
    end

    def file_link
      "<a href='source/#{@cls[:href]}'>#{File.basename(@cls[:filename])}</a>"
    end

    def extends_link
      if @cls[:extends]
        @relations[@cls[:extends]] ? class_link(@cls[:extends]) : @cls[:extends]
      else
        "Object"
      end
    end

    def classes_row(label, classes)
      if classes.length > 0
        classes = classes.sort {|a, b| a.short_name <=> b.short_name }
        html = classes.collect {|cls| class_link(cls.full_name, cls.short_name) }.join(", ")
        row(label, html)
      else
        ""
      end
    end

    def boolean_row(label, item)
      item ? row(label, CGI.escapeHTML(item)) : ""
    end

    def row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@formatter.format(@cls[:doc])}</div>"
    end
  end

end
