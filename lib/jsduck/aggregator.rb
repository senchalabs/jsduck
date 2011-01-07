require 'jsduck/parser'
require 'jsduck/doc_parser'
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
      @doc_parser = DocParser.new
      @merger = Merger.new
    end

    def parse(input, filename="")
      @current_class = nil
      Parser.new(input).parse.each do |docset|
        doc = @doc_parser.parse(docset[:comment])
        code = docset[:code]
        href = filename + "#line-" + docset[:linenr].to_s
        register(add_href(@merger.merge(doc, code), href))
      end
    end

    # Tags doc-object with link to source code where it came from
    def add_href(doc, href)
      doc[:href] = href
      if doc[:tagname] == :class
        doc[:cfg].each {|cfg| cfg[:href] = href }
        doc[:method].each {|method| method[:href] = href }
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
      [:extends, :xtype, :singleton, :private].each do |tag|
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

    def result
      @documentation + @orphans
    end
  end

end
