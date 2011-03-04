
module JsDuck

  # Creator of package-tree in the format expected by the
  # documentation browser UI.
  #
  # See unit test for example output.
  #
  class Members
    def initialize
      @root = {
        :data => []
      }
    end

    # Given list of class documentation objects returns a
    # tree-structure that can be turned into JSON that's needed by
    # documentation browser interface.
    def create(docs)
      docs.each {|cls| add_class(cls) }
      #sort_tree(@root)
      @root
    end

    # Sorts all child nodes, and recursively all child packages.
    def sort_tree(node)
      node[:data].sort! {|a,b| compare(a, b) }
    end

    # Comparson method that sorts package nodes before class nodes.
    def compare(a, b)
      if a[:cls] == b[:cls]
        a[:member] <=> b[:member]
      else
        a[:cls] <=> b[:cls]
      end
    end

    # When package for the class exists, add class node to that
    # package; otherwise create the package first.
    def add_class(cls)
      cls.members(:cfg).each do |m|
        @root[:data] << member_node(m, cls)
      end
      cls.members(:property).each do |m|
        @root[:data] << member_node(m, cls)
      end
      cls.members(:method).each do |m|
        @root[:data] << member_node(m, cls)
      end
      cls.members(:event).each do |m|
        @root[:data] << member_node(m, cls)
      end
    end

    # Given full doc object for class creates class node
    def member_node(m, cls)
      #puts "DBG: #{m}"
      return {
        :cls => "#{cls.full_name}",
        :member => m[:name],
        :type => m[:tagname],
        :doc => m[:doc]
      }
    end

  end

end
