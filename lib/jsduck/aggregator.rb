require 'jsduck/class'
require 'jsduck/accessors'
require 'jsduck/logger'
require 'jsduck/enum'
require 'jsduck/override'

module JsDuck

  # Combines JavaScript Parser, DocParser and Merger.
  # Produces array of classes as result.
  class Aggregator
    def initialize
      @documentation = []
      @classes = {}
      @alt_names = {}
      @orphans = []
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
      if !old_cls && @alt_names[cls[:name]]
        old_cls = @alt_names[cls[:name]]
        warn_alt_name(cls)
      end

      if old_cls
        merge_classes(old_cls, cls)
        @current_class = old_cls
      else
        @current_class = cls
        @documentation << cls
        @classes[cls[:name]] = cls

        # Register all alternate names of class for lookup too
        cls[:alternateClassNames].each do |altname|
          if cls[:name] == altname
            # A buggy documentation, warn.
            warn_alt_name(cls)
          else
            @alt_names[altname] = cls
            # When an alternate name has been used as a class name before,
            # then this is one crappy documentation, but attempt to handle
            # it by merging the class with alt-name into this class.
            if @classes[altname]
              merge_classes(cls, @classes[altname])
              @documentation.delete(@classes[altname])
              @classes.delete(altname)
              warn_alt_name(cls)
            end
          end
        end

        insert_orphans(cls)
      end
    end

    def warn_alt_name(cls)
      file = cls[:files][0][:filename]
      line = cls[:files][0][:linenr]
      Logger.warn(:alt_name, "Name #{cls[:name]} used as both classname and alternate classname", file, line)
    end

    # Merges new class-doc into old one.
    def merge_classes(old, new)
      # Merge booleans
      [:extends, :singleton, :private].each do |tag|
        old[tag] = old[tag] || new[tag]
      end
      # Merge arrays
      [:mixins, :alternateClassNames, :files].each do |tag|
        old[tag] = old[tag] + new[tag]
      end
      # Merge meta hashes
      new[:meta].each_pair do |name, value|
        old[:meta][name] = old[:meta][name] || value
      end
      # Merge hashes of arrays
      [:aliases].each do |tag|
        new[tag].each_pair do |key, contents|
          old[tag][key] = (old[tag][key] || []) + contents
        end
      end
      old[:doc] = old[:doc].length > 0 ? old[:doc] : new[:doc]
      # Additionally the doc-comment can contain configs and constructor
      old[:members] += new[:members]
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
      # Completely ignore member if @ignore used
      return if node[:meta][:ignore]

      if node[:owner]
        if @classes[node[:owner]]
          add_to_class(@classes[node[:owner]], node)
        else
          add_orphan(node)
        end
      elsif @current_class
        node[:owner] = @current_class[:name]
        add_to_class(@current_class, node)
      else
        add_orphan(node)
      end
    end

    def add_to_class(cls, member)
      cls[:members] << member
    end

    def add_orphan(node)
      @orphans << node
    end

    # Inserts available orphans to class
    def insert_orphans(cls)
      members = @orphans.find_all {|node| node[:owner] == cls[:name] }
      members.each do |node|
        add_to_class(cls, node)
        @orphans.delete(node)
      end
    end

    # Creates classes for orphans that have :owner property defined,
    # and then inserts orphans to these classes.
    def classify_orphans
      # Clone the orphans array first to avoid problems with
      # #inster_orphan method deleting items from @orphans array.
      @orphans.clone.each do |orph|
        if orph[:owner]
          class_name = orph[:owner]
          if !@classes[class_name]
            # this will add the class and add all orphans to it
            add_empty_class(class_name)
          end
        end
      end
    end

    # Creates class with name "global" and inserts all the remaining
    # orphans into it (but only if there are any orphans).
    def create_global_class
      return if @orphans.length == 0

      add_empty_class("global", "Global variables and functions.")
      @orphans.each do |orph|
        orph[:owner] = "global"
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
        :members => [],
        :aliases => {},
        :meta => {},
        :files => [{:filename => "", :linenr => 0, :href => ""}],
      })
    end

    # Gets rid of classes marked with @ignore
    def remove_ignored_classes
      @documentation.delete_if do |cls|
        if cls[:meta][:ignore]
          @classes.delete(cls["name"])
          true
        end
      end
    end

    # Appends Ext4 options parameter to each event parameter list.
    def append_ext4_event_options
      options = {
        :tagname => :param,
        :name => "eOpts",
        :type => "Object",
        :doc => "The options object passed to {@link Ext.util.Observable#addListener}."
      }
      @classes.each_value do |cls|
        cls[:members].each do |m|
          m[:params] << options if m[:tagname] == :event
        end
      end
    end

    # Creates accessor method for configs marked with @accessor
    def create_accessors
      accessors = Accessors.new
      @classes.each_value do |cls|
        accessors.create(cls)
      end
    end

    # Loops through all enums and auto-detects their types if needed.
    def process_enums
      Enum.new(@classes).process_all!
    end

    # Processes all overrides.
    # Returns list of override classes.
    def process_overrides
      Override.new(@classes).process_all!.map do |cls|
        # discard each override class
        @classes.delete(cls[:name])
        @documentation.delete(cls)
        cls
      end
    end

    # Are we dealing with ExtJS 4?
    # True if any of the classes is defined with Ext.define()
    def ext4?
      @documentation.any? {|cls| cls[:code_type] == :ext_define }
    end

    def result
      @documentation + @orphans
    end
  end

end
