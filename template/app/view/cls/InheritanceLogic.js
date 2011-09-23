/**
 * Creates inheritance-based tree-structure.
 */
Ext.define('Docs.view.cls.InheritanceLogic', {
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

        this.subclasses = this.buildLookupTable(this.classes);
        Ext.Array.forEach(this.classes, this.addClass, this);
        this.sortTree(this.root);
        return this.root;
    },

    sortTree: function(node) {
      node.children.sort(this.compare, this);
      Ext.Array.forEach(node.children, this.sortTree, this);
    },

    // Comparson method that sorts names case-insensitively
    compare: function(a, b) {
        var aa = a.text.toLowerCase();
        var bb = b.text.toLowerCase();
        return aa > bb ? 1 : (aa < bb ? -1 : 0);
    },

    // Builds lookup table for subclasses
    buildLookupTable: function(classes) {
        var map = {};
        Ext.Array.forEach(classes, function(cls) {
            if (cls["private"] && !this.showPrivateClasses) {
                return;
            }
            var parent = cls["extends"];
            if (parent && parent !== "Object") {
                if (!map[parent]) {
                    map[parent] = [];
                }
                map[parent].push(cls);
            }
        }, this);
        return map;
    },

    // Given full doc object for class creates class node
    classNode: function(cls) {
      return {
        text: cls.name,
        url: "#!/api/"+cls.name,
        iconCls: cls.icon,
        cls: cls["private"] ? "private" : ""
      };
    },

    addClass: function(cls) {
        if (cls["private"] && !this.showPrivateClasses) {
            return;
        }
        var parent = cls["extends"];
        if (!parent || parent === "Object") {
            var node = this.classNode(cls);
            this.root.children.push(node);
            node.children = this.getSubclasses(cls.name);
            node.leaf = node.children.length === 0;
        }
    },

    getSubclasses: function(name) {
        if (!this.subclasses[name]) {
            return [];
        }
        return Ext.Array.map(this.subclasses[name], function(cls) {
            var node = this.classNode(cls);
            node.children = this.getSubclasses(cls.name);
            node.leaf = node.children.length === 0;
            return node;
        }, this);
    }

});
