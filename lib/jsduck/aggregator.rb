module JsDuck

  # Combines JavaScript Parser, DocParser and Merger.
  # Produces array of classes as result.
  class Aggregator
    def initialize
      @documentation = []
      @classes = {}
      @orphans = []
      @aliases = []
      @current_class = nil
    end

    # Combines chunk of parsed JavaScript together with previously
    # added chunks.  The resulting documentation is accumulated inside
    # this class and can be later accessed through #result method.
    #
    # - file  SoureFile class instance
    #
    def aggregate(file)
      @current_class = nil
      file.each {|doc| register(doc) }
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
      [:extends, :xtype, :singleton, :private, :protected].each do |tag|
        old[tag] = old[tag] || new[tag]
      end
      [:mixins, :alternateClassNames, :xtypes].each do |tag|
        old[tag] = old[tag] + new[tag]
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
      @aliases << node if node[:alias]
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

    # Copy over doc/params/return from original methods to aliases.
    # Aliases are currently only supported for methods.
    def populate_aliases
      @aliases.each do |al|
        orig = get_member(al[:alias][:cls], al[:alias][:member])
        al[:doc] = al[:doc] + "\n\n" + orig[:doc]
        al[:params] = orig[:params]
        al[:return] = orig[:return]
      end
    end

    def get_member(cls_name, member_name)
      cls = @classes[cls_name]
      return cls[:method].find {|m| m[:name] == member_name }
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
      add_class({
        :tagname => :class,
        :name => name,
        :doc => doc,
        :mixins => [],
        :alternateClassNames => [],
        :cfg => [],
        :property => [],
        :method => [],
        :event => [],
        :css_var => [],
        :css_mixin => [],
        :filename => "",
        :html_filename => "",
        :linenr => 0,
      })
    end

    def result
      @documentation + @orphans
    end
  end

end
