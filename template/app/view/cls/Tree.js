/**
 * Tree for classes.
 */
Ext.define('Docs.view.cls.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.classtree',
    requires: [
        'Docs.view.cls.PackageLogic',
        'Docs.view.cls.InheritanceLogic',
        'Docs.Settings'
    ],

    /**
     * @cfg {Object[]} data (required)
     * An array of classes
     */

    initComponent: function() {
        this.setLogic(Docs.Settings.get("classTreeLogic"), Docs.Settings.get("showPrivateClasses"));

        this.dockedItems = [
// Ti change -- suppress the private classes checkbox. 
// Could surely be done more elegantly via configuration.
/*            {
                xtype: 'container',
                dock: 'bottom',
                layout: 'hbox',
                items: [
                    {width: 34},
                    {
                        xtype: 'checkbox',
                        boxLabel: 'Show private classes',
                        cls: 'cls-private-cb',
                        checked: Docs.Settings.get("showPrivateClasses"),
                        listeners: {
                            change: function(cb, checked) {
                                this.setLogic(Docs.Settings.get("classTreeLogic"), checked);
                            },
                            scope: this
                        }
                    }
                ]
            },
*/
            {
                xtype: 'container',
                dock: 'bottom',
                cls: 'cls-grouping',
                html: [
                    this.makeButtonHtml("PackageLogic", "By Package"),
                    this.makeButtonHtml("InheritanceLogic", "By Inheritance")
                ].join('')
            }
        ];

        this.on("afterrender", this.setupButtonClickHandler, this);

        this.callParent();
    },

    makeButtonHtml: function(logic, text) {
        return Ext.String.format(
            '<button class="{0} {1}">{2}</button>',
            logic,
            Docs.Settings.get("classTreeLogic") === logic ? "selected" : "",
            text
        );
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

            if (clicked.hasCls('PackageLogic')) {
                this.setLogic("PackageLogic", Docs.Settings.get("showPrivateClasses"));
            } else {
                this.setLogic("InheritanceLogic", Docs.Settings.get("showPrivateClasses"));
            }
        }, this, {
            delegate: 'button'
        });
    },

    setLogic: function(logic, showPrivateClasses) {
        Docs.Settings.set("classTreeLogic", logic);
        Docs.Settings.set("showPrivateClasses", showPrivateClasses);

        var tree = new Docs.view.cls[logic]({classes: this.data, showPrivateClasses: showPrivateClasses});
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
