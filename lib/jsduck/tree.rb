
module JsDuck

  # Creator of package-tree in the format expected by the
  # documentation browser UI.
  #
  # See unit test for example output.
  #
  class Tree
    def initialize
      @root = {
        :id => "apidocs",
        :iconCls => "icon-docs",
        :text => "API Documentation",
        :singleClickExpand => true,
        :children => []
      }
      @packages = {"" => @root}
    end

    # Given list of class documentation objects returns a
    # tree-structure that can be turned into JSON that's needed by
    # documentation browser interface.
    def create(docs)
      docs.each {|cls| add_class(cls) }
      sort_tree(@root)
      @root
    end

    # Sorts all child nodes, and recursively all child packages.
    def sort_tree(node)
      node[:children].sort! {|a,b| compare(a, b) }
      node[:children].find_all {|c| c[:cls] == "package" }.each {|c| sort_tree(c) }
    end

    # Comparson method that sorts package nodes before class nodes.
    def compare(a, b)
      if a[:cls] == b[:cls]
        a[:text] <=> b[:text]
      else
        a[:cls] == "package" ? -1 : 1
      end
    end

    # When package for the class exists, add class node to that
    # package; otherwise create the package first.
    def add_class(cls)
      parent_name = cls.package_name
      parent = @packages[parent_name] || add_package(parent_name)
      parent[:children] << class_node(cls)
    end

    # When parent package exists, add new package node into it, also
    # record the package into @packages hash for quick lookups;
    # otherwise create the parent package first.
    #
    # Note that the root package always exists, so we can safely
    # recurse knowing we will eventually stop.
    def add_package(name)
      parent_name = Class.package_name(name)
      parent = @packages[parent_name] || add_package(parent_name)
      package = package_node(name)
      parent[:children] << package
      @packages[name] = package
      package
    end

    # Given full doc object for class creates class node
    def class_node(cls)
      return {
        :href => "output/#{cls.full_name}.html",
        :text => cls.short_name,
        :id => cls.full_name,
        :isClass => true,
        :iconCls => cls[:singleton] ? "icon-static" : "icon-cls",
        :cls => "cls",
        :leaf => true
      }
    end

    # Given full package name like my.package creates package node
    def package_node(name)
      return {
        :id => "pkg-#{name}",
        :text => Class.short_name(name),
        :iconCls => "icon-pkg",
        :cls => "package",
        :singleClickExpand => true,
        :children => []
      }
    end
  end

end
