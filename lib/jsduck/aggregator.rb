require 'jsduck/merger'

module JsDuck

  # Combines JavaScript Parser, DocParser and Merger.
  # Produces array of classes as result.
  class Aggregator
    def initialize
      @documentation = []
      @classes = {}
      @orphans = []
      @current_class = nil
      @merger = Merger.new
    end

    # Combines chunk of parsed JavaScript together with previously
    # added chunks.  The resulting documentation is accumulated inside
    # this class and can be later accessed through #result method.
    #
    # - input  parse result from JsDuck::Parser
    # - filename  name of the JS file where it came from
    # - html_filename  name of the HTML file where the source was saved.
    #
    def aggregate(input, filename="", html_filename="")
      @current_class = nil
      input.each do |docset|
        doc = @merger.merge(docset[:comment], docset[:code])

        add_source_data(doc, {
          :filename => filename,
          :html_filename => html_filename,
          :linenr => docset[:linenr],
        })

        register(doc)
      end
    end

    # Links doc-object to source code where it came from.
    def add_source_data(doc, src)
      doc[:href] = src[:html_filename] + "#line-" + src[:linenr].to_s
      doc[:filename] = src[:filename]
      doc[:linenr] = src[:linenr]
      # class-level doc-comment can contain constructor and config
      # options, link those to the same location in source.
      if doc[:tagname] == :class
        doc[:cfg].each {|cfg| add_source_data(cfg, src) }
        doc[:method].each {|method| add_source_data(method, src) }
      end
      doc
    end

    # Registers documentation node either as class or as member of
    # some class.
    def register(node)
      if node[:tagname] == :class
        add_class(node)
      else
        add_member(node)
      end
    end

    # When class exists, merge it with class node.
    # Otherwise add as new class.
    def add_class(cls)
      old_cls = @classes[cls[:name]]
      if old_cls
        merge_classes(old_cls, cls)
        @current_class = old_cls
      else
        @current_class = cls
        @documentation << cls
        @classes[cls[:name]] = cls
        insert_orphans(cls)
      end
    end

    # Merges new class-doc into old one.
    def merge_classes(old, new)
      [:extends, :xtype, :singleton, :private, :alternateClassName].each do |tag|
        old[tag] = old[tag] || new[tag]
      end
      old[:doc] = old[:doc].length > 0 ? old[:doc] : new[:doc]
      old[:cfg] = old[:cfg] + new[:cfg]
    end

    # Tries to place members into classes where they belong.
    #
    # @member explicitly defines the containing class, but we can meet
    # item with @member=Foo before we actually meet class Foo - in
    # that case we register them as orphans.  (Later when we finally
    # meet class Foo, orphans are inserted into it.)
    #
    # Items without @member belong by default to the preceding class.
    # When no class precedes them - they too are orphaned.
    def add_member(node)
      if node[:member]
        if @classes[node[:member]]
          @classes[node[:member]][node[:tagname]] << node
        else
          add_orphan(node)
        end
      elsif @current_class
        node[:member] = @current_class[:name]
        @current_class[ node[:tagname] ] << node
      else
        add_orphan(node)
      end
    end

    def add_orphan(node)
      @orphans << node
    end

    # Inserts available orphans to class
    def insert_orphans(cls)
      members = @orphans.find_all {|node| node[:member] == cls[:name] }
      members.each do |node|
        cls[node[:tagname]] << node
        @orphans.delete(node)
      end
    end

    # Creates classes for orphans that have :member property defined,
    # and then inserts orphans to these classes.
    def classify_orphans
      @orphans.each do |orph|
        if orph[:member]
          class_name = orph[:member]
          if !@classes[class_name]
            add_empty_class(class_name)
          end
          add_member(orph)
          @orphans.delete(orph)
        end
      end
    end

    # Creates class with name "global" and inserts all the remaining
    # orphans into it (but only if there are any orphans).
    def create_global_class
      return if @orphans.length == 0

      add_empty_class("global", "Global variables and functions.")
      @orphans.each do |orph|
        orph[:member] = "global"
        add_member(orph)
      end
      @orphans = []
    end

    def add_empty_class(name, doc = "")
      cls = {
        :tagname => :class,
        :name => name,
        :doc => "",
        :cfg => [],
        :property => [],
        :method => [],
        :event => [],
        :css_var => [],
        :css_mixin => [],
      }
      add_source_data(cls, {
          :filename => "",
          :html_filename => "",
          :linenr => 0,
        })
      add_class(cls)
    end

    def result
      @documentation + @orphans
    end
  end

end
