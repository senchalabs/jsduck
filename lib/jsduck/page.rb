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
    end

    def to_html
      [
       '<div class="body-wrap">',
       inheritance_tree,
       heading,
       abstract,
       description,
       "<div class='hr'></div>",
       CfgTable.new(@cls, @cache).to_html,
       PropertyTable.new(@cls, @cache).to_html,
       MethodTable.new(@cls, @cache).to_html,
       EventTable.new(@cls, @cache).to_html,
       "</div>",
      ].join("\n")
    end

    # only render the tree if class has at least one ancestor
    def inheritance_tree
      @cls.parent ? InheritanceTree.new(@cls).to_html : ""
    end

    def heading
      "<h1>Class <a href='source/#{@cls[:href]}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
        abstract_row("Extends:", @cls.parent ? class_link(@cls.parent.full_name) : "Object"),
        @cls.mixins.length > 0 ? abstract_row("Mixins:", mixins) : "",
        abstract_row("Defind In:", file_link),
        @relations.subclasses(@cls).length > 0 ? abstract_row("Subclasses:", subclasses) : "",
        @cls[:xtype] ? abstract_row("xtype:", @cls[:xtype]) : "",
        @cls[:author] ? abstract_row("Author:", @cls[:author]) : "",
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

    def subclasses
      subs = @relations.subclasses(@cls).sort {|a, b| a.short_name <=> b.short_name }
      subs.collect {|cls| class_link(cls.full_name, cls.short_name) }.join(", ")
    end

    def mixins
      mixs = @cls.mixins.sort {|a, b| a.full_name <=> b.full_name }
      mixs.collect {|cls| class_link(cls.full_name, cls.short_name) }.join(", ")
    end

    def abstract_row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@formatter.format(@cls[:doc])}</div>"
    end
  end

end
