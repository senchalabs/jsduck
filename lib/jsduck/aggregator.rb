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

    def parse(input)
      @current_class = nil
      Parser.new(input).parse.each do |docset|
        doc = @doc_parser.parse(docset[:comment])
        code = docset[:code]
        register(@merger.merge(doc, code))
      end
    end

    # Registers documentation node.
    #
    # For each :class we create new node.  Other things we try to
    # place into classes where they belong.
    #
    # @member explicitly defines that containing class, but we can
    # meet entity with member=Foo before we actually meet class Foo -
    # in that case we register them as orphans.  (Later when we
    # finally meet class Foo, orphans are inserted into it.)
    #
    # Items without @member belong by default to the preceding class.
    # When no class precedes them - they too are orphaned.
    def register(node)
      if node[:tagname] == :class
        @current_class = node
        @documentation << node
        @classes[node[:name]] = node
        insert_orphans(node)
      elsif node[:member]
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
