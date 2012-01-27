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
        this.setLogic(Docs.view.cls.PackageLogic, false);

        this.dockedItems = [
            {
                xtype: 'container',
                dock: 'bottom',
                layout: 'hbox',
                items: [
                    {width: 34},
                    {
                        xtype: 'checkbox',
                        boxLabel: 'Show private classes',
                        cls: 'cls-private-cb',
                        listeners: {
                            change: function(cb, checked) {
                                this.setLogic(this.logic, checked);
                            },
                            scope: this
                        }
                    }
                ]
            },
            {
                xtype: 'container',
                dock: 'bottom',
                cls: 'cls-grouping',
                html: [
                    '<button class="by-package selected">By Package</button>',
                    '<button class="by-inheritance">By Inheritance</button>'
                ].join('')
            }
        ];

        this.on("afterrender", this.setupButtonClickHandler, this);

        this.callParent();
    },

    setupButtonClickHandler: function() {
        this.el.addListener('click', function(e, el) {
            var clicked = Ext.get(el),
            selected = Ext.get(Ext.query('.cls-grouping button.selected')[0]);

            if (selected.dom === clicked.dom) {
                return;
            }

            selected.removeCls('selected');
            clicked.addCls('selected');

            if (clicked.hasCls('by-package')) {
                this.setLogic(Docs.view.cls.PackageLogic, this.showPrivate);
            } else {
                this.setLogic(Docs.view.cls.InheritanceLogic, this.showPrivate);
            }
        }, this, {
            delegate: 'button'
        });
    },

    setLogic: function(logic, showPrivate) {
        this.logic = logic;
        this.showPrivate = showPrivate;
        var tree = new logic({classes: this.data, showPrivateClasses: showPrivate});
        if (this.root) {
            // remember the current selection
            var selected = this.getSelectionModel().getLastSelected();
            // create new treestructure
            var root = tree.create();
            this.expandLonelyNode(root);
            this.setRootNode(root);
            this.initNodeLinks();

            // re-establish the previous selection
            selected && this.selectUrl(selected.raw.url);
        }
        else {
            this.root = tree.create();
            this.expandLonelyNode(this.root);
        }
    },

    // When only one expandable node at root level, expand it
    expandLonelyNode: function(root) {
        var expandableNodes = Ext.Array.filter(root.children, function(node) {
            return node.children.length > 0;
        });
        if (expandableNodes.length == 1) {
            expandableNodes[0].expanded = true;
        }
    }
});
