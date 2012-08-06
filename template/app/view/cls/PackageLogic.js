/**
 * Creates package-based tree-structure.
 */
Ext.define('Docs.view.cls.PackageLogic', {
    extend: 'Docs.view.cls.Logic',

    /**
     * Creates the tree.
     * @return {Object} the tree.
     */
    create: function() {
        this.root = {
            children: [],
            text: 'Root'
        };
        this.packages = {"": this.root};
        Ext.Array.forEach(this.classes, this.addClass, this);
        this.sortTree(this.root);
        return this.root;
    },

    // Sorts all child nodes, and recursively all child packages.
    sortTree: function(node) {
        node.children.sort(this.compare);
        Ext.Array.forEach(node.children, this.sortTree, this);
    },

    // Comparson method that sorts package nodes before class nodes.
    // Note changes for Ti, where isObject takes the place of .leaf
    // because our object models differ... Can this be abstracted?
    compare: function(a, b) {
        if (a.isObject === b.isObject) {
            var aa = a.text.toLowerCase();
            var bb = b.text.toLowerCase();
            return aa > bb ? 1 : (aa < bb ? -1 : 0);
        }
        else {
            return a.isObject ? 1 : -1;
        }
    },

    // When package for the class exists, add class node to that
    // package; otherwise create the package first.
    // For Ti, add isObject flag.
    addClass: function(cls) {
        if (cls["private"] && !this.showPrivateClasses) {
            return;
        }
        if (this.packages[cls.name]) {
            // node already exists. This happes with classes like Ext
            // that are both a package and a class.
            // Just add icon and URL to the node.
            var pkg = this.packages[cls.name];
            var node = this.classNode(cls);
			pkg.isObject = cls.isObject;
            pkg.iconCls = node.iconCls;
            pkg.url = node.url;
        }
        else {
            var parentName = this.packageName(cls.name);
            var parent = this.packages[parentName] || this.addPackage(parentName);
            if (parent.leaf) {
                parent.leaf = false;
            }
            var node = this.classNode(cls);
			node.isObject = cls.isObject;
            parent.children.push(node);
            this.packages[cls.name] = node;
        }
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
        url: "#!/api/"+cls.name,
        iconCls: cls.icon,
        cls: cls["private"] ? "private" : "",
        leaf: true,
        children: []
      };
    },

    // Given full package name like my.package creates package node
    packageNode: function(name) {
      return {
        text: this.shortName(name),
		// Ti change -- class name from 'icon-pkg' to 'icon-class' ... seems kind of arbitrary
        iconCls: "icon-class",
        leaf: false,
        children: []
      };
    },

    // Utility method that given a package or class name finds the name
    // of its parent package.
    packageName: function(name) {
      return name.slice(0, -this.shortName(name).length - 1) || "";
    },

    // Utility method that given full package or class name extracts
    // the "class"-part of the name.
    shortName: function(name) {
      var parts = name.split(/\./);
      return parts.pop();
    }

});
