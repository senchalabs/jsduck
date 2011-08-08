/**
 * Tree for classes.
 */
Ext.define('Docs.view.cls.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.classtree',

    /**
     * @cfg {Object[]} data (required)
     * An array of classes
     */

    initComponent: function() {
        this.root = {
            children: [],
            text: 'Root'
        };
        this.packages = {"": this.root};
        this.lookup = this.buildLookupTable(this.data);
        Ext.Array.forEach(this.data, this.addClass, this);
        this.sortTree(this.root);
        this.callParent();
    },

    buildLookupTable: function(classes) {
        var table = {};
        Ext.Array.forEach(classes, function(cls) {
            table[cls.name] = cls;
        });
        return table;
    },

    // Sorts all child nodes, and recursively all child packages.
    sortTree: function(node) {
      node.children.sort(this.compare, this);
      Ext.Array.forEach(node.children, function(c) {
          c.children && this.sortTree(c);
      }, this);
    },

    // Comparson method that sorts package nodes before class nodes.
    compare: function(a, b) {
        if (a.leaf === b.leaf) {
            var aa = a.text.toLowerCase();
            var bb = b.text.toLowerCase();
            return aa > bb ? 1 : (aa < bb ? -1 : 0);
        }
        else {
            return a.leaf ? 1 : -1;
        }
    },

    // When package for the class exists, add class node to that
    // package; otherwise create the package first.
    addClass: function(cls) {
        var parentName = this.packageName(cls.name);
        var parent = this.packages[parentName] || this.addPackage(parentName);
        parent.children.push(this.classNode(cls));
    },

    // When parent package exists, add new package node into it, also
    // record the package into this.packages hash for quick lookups;
    // otherwise create the parent package first.
    //
    // Note that the root package always exists, so we can safely
    // recurse knowing we will eventually stop.
    addPackage: function(name) {
      var parentName = this.packageName(name);
      var parent = this.packages[parentName] || this.addPackage(parentName);
      var pkg = this.packageNode(name);
      parent.children.push(pkg);
      this.packages[name] = pkg;
      return pkg;
    },

    // Given full doc object for class creates class node
    classNode: function(cls) {
      return {
        text: this.shortName(cls.name),
        url: "/api/"+cls.name,
        iconCls: this.classIcon(cls),
        leaf: true
      };
    },

    // Given full package name like my.package creates package node
    packageNode: function(name) {
      return {
        text: this.shortName(name),
        iconCls: "icon-pkg",
        children: []
      };
    },

    classIcon: function(cls) {
        if (cls.singleton) {
            return "icon-singleton";
        }
        else if (this.isComponent(cls)) {
            return "icon-component";
        }
        else {
            return "icon-class";
        }
    },

    // True when class is a component
    isComponent: function(cls) {
        if (cls.name === "Ext.Component") {
            return true;
        }
        else {
            var parent = this.lookup[cls["extends"]];
            return parent ? this.isComponent(parent) : false;
        }
    },

    // Utility method that given a package or class name finds the name
    // of its parent package.
    packageName: function(name) {
      return name.slice(0, -this.shortName(name).length - 1) || "";
    },

    // Utility method that given full package or class name extracts
    // the "class"-part of the name.
    //
    // Because we try to emulate ext-doc, it's not as simple as just
    // taking the last part.
    shortName: function(name) {
      var parts = name.split(/\./);
      var srt = parts.pop();
      while (parts.length > 1 && /^[A-Z]/.test(parts[parts.length-1])) {
        srt = parts.pop() + "." + srt;
      }
      return srt;
    }

});
