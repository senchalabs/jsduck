/**
 * The main viewport, split in to a west and center region.
 * The North region should also be shown by default in the packaged
 * (non-live) version of the docs. TODO: close button on north region.
 */
Ext.define('Docs.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Docs.view.cls.Header',
        'Docs.view.cls.Overview',
        'Docs.view.index.Container',
        'Docs.view.tree.Tree',
        'Docs.view.ClassGrid',
        'Docs.Favorites',
        'Docs.Settings',
        'Docs.History'
    ],

    id: 'viewport',
    layout: 'border',
    defaults: { xtype: 'container' },

    initComponent: function() {
        this.items = [

            {
                region:'west',
                width: 240,
                id: 'west-region-container',
                padding: '5 0 0 0',
                layout: 'vbox',
                defaults: {
                    xtype: 'container',
                    width: "100%"
                },
                items: [
                    {
                        xtype: 'button',
                        cls: 'logo',
                        height: 60,
                        margin: '0 0 10 10',
                        width: 220,
                        border: 0,
                        ui: 'hmm',
                        listeners: {
                            click: function() {
                                Docs.App.getController('Classes').loadIndex();
                            },
                            scope: this
                        }
                    },
                    {
                        cls: 'search',
                        id: 'search-container',
                        margin: '0 0 0 5',
                        height: 40,
                        items: [
                            {
                                xtype: 'triggerfield',
                                triggerCls: 'reset',
                                emptyText: 'Search',
                                id: 'search-field',
                                enableKeyEvents: true,
                                hideTrigger: true,
                                onTriggerClick: function() {
                                    this.reset();
                                    this.focus();
                                    this.setHideTrigger(true);
                                    Ext.getCmp('search-dropdown').hide();
                                }
                            },
                            {
                                xtype: 'searchdropdown'
                            }
                        ]
                    },
                    {
                        id: 'nested-west-region-container',
                        flex: 1,
                        layout: 'border',
                        border: false,
                        items: [
                            {
                                id: 'classes-tab-panel',
                                xtype: 'tabpanel',
                                region: 'north',
                                height: Docs.Settings.get('favorites-height') || 150,
                                padding: '2 4 0 0',
                                bodyPadding: '3 15 0 12',
                                border: false,
                                plain: true,
                                split: true,
                                listeners: {
                                    afterRender: function() {
                                        // Add 7px padding at left side of tab-bar
                                        this.tabBar.insert(0, {width: 7, xtype: 'container'});
                                    },
                                    resize: function(cmp, w, h) {
                                        Docs.Settings.set('favorites-height', h);
                                    }
                                },
                                items: [
                                    {
                                        xtype: 'classgrid',
                                        id: 'favorites-grid',
                                        title: 'Favorites',
                                        iconCls: 'icon-fav',
                                        viewConfig: {
                                            plugins: [{
                                                pluginId: 'favGridDD',
                                                ptype: 'gridviewdragdrop',
                                                animate: true,
                                                dragText: 'Drag and drop to reorganize'
                                            }],
                                            listeners: {
                                                drop: function() {
                                                    // Hack to fix a bug in localStorage which prevents the order of
                                                    // items being saved when they're changed
                                                    var store = Ext.getStore('Favorites');
                                                    store.getProxy().setIds(Ext.Array.map(store.data.items, function(i) { return i.data.id; }));
                                                }
                                            }
                                        },
                                        store: Ext.getStore('Favorites'),
                                        icons: Docs.icons,
                                        listeners: {
                                            closeclick: function(cls) {
                                                Docs.Favorites.remove(cls);
                                            },
                                            // Prevent row highlighting when doing drag-drop
                                            afterrender: function() {
                                                var ddPlugin = this.getView().getPlugin('favGridDD');

                                                ddPlugin.dragZone.onInitDrag = function() {
                                                    Ext.getCmp('favorites-grid').addCls('drag');
                                                    Ext.view.DragZone.prototype.onInitDrag.apply(this, arguments);
                                                };
                                                ddPlugin.dragZone.afterValidDrop = ddPlugin.dragZone.afterInvalidDrop = function() {
                                                    Ext.getCmp('favorites-grid').removeCls('drag');
                                                };
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                region: 'center',
                                xtype: 'classtree',
                                padding: '5 10 0 10',
                                margin: '0 5 2 0',
                                root: Docs.classData
                                // dockedItems: [{
                                //     xtype: 'toolbar',
                                //     baseCls: null,
                                //     dock: 'top',
                                //     padding: '0 0 5 0',
                                //     items: [
                                //         {
                                //             xtype: 'button',
                                //             text: 'Sort by Package',
                                //             menu: [
                                //                 { text: 'by Category' },
                                //                 { text: 'by Hierarchy' },
                                //                 { text: 'by Popularity' }
                                //             ]
                                //         },
                                //         { xtype: 'tbfill'},
                                //         {
                                //             xtype: 'button',
                                //             iconCls: 'expandAllMembers',
                                //             tooltip: "Expand all"
                                //         }
                                //     ]
                                // }]
                            }
                        ]
                    }
                ]
            },
            {
                region: 'center',
                id: 'center-container',
                layout: 'fit',
                minWidth: 800,
                padding: '20 20 5 0',
                items: {
                    id: 'card-panel',
                    cls: 'card-panel',
                    xtype: 'container',
                    layout: 'card',
                    padding: '20',
                    items: [
                        {
                            autoScroll: true,
                            xtype: 'indexcontainer'
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                {xtype: 'classheader'},
                                {xtype: 'classoverview', flex: 1}
                            ]
                        },
                        {
                            autoScroll: true,
                            xtype: 'container',
                            id: 'guide'
                        },
                        {
                            xtype: 'container',
                            id: 'failure'
                        }
                    ]
                }
            },
            {
                region: 'south',
                id: 'footer',
                contentEl: 'footer-content',
                height: 15
            }
        ];

        this.callParent(arguments);
    },

    /**
     * Sets the contents of `<title>` tag.
     * @param {String} text
     */
    setPageTitle: function(text) {
        text = Ext.util.Format.stripTags(text);
        if (!this.origTitle) {
            this.origTitle = document.title;
        }
        document.title = text ? (text + " - " + this.origTitle) : this.origTitle;
    }
});
