/**
 * Tree for classes.
 */
Ext.define('Docs.view.cls.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.classtree',
    requires: [
        'Docs.view.cls.PackageLogic',
        'Docs.view.cls.InheritanceLogic'
    ],

    /**
     * @cfg {Object[]} data (required)
     * An array of classes
     */

    initComponent: function() {
        this.setLogic(Docs.view.cls.PackageLogic);

        this.dockedItems = [{
            xtype: 'container',
            dock: 'bottom',
            cls: 'cls-grouping',
            html: [
                '<button class="by-package selected">By Package</button>',
                '<button class="by-inheritance">By Inheritance</button>'
            ].join('')
        }];

        this.callParent();
    },

    setLogic: function(logic) {
        var tree = new logic({classes: this.data, showPrivateClasses: true});
        if (this.root) {
            // remember the current selection
            var selected = this.getSelectionModel().getLastSelected();
            // create new treestructure
            var root = tree.create();
            this.setRootNode(root);
            this.initNodeLinks();
            // expand first child
            this.getRootNode().getChildAt(0).expand();
            // re-establish the previous selection
            selected && this.selectUrl(selected.raw.url);
        }
        else {
            this.root = tree.create();
        }
    }
});
