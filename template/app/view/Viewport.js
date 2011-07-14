/**
 * The main viewport, split in to a west and center region.
 * The North region should also be shown by default in the packaged
 * (non-live) version of the docs. TODO: close button on north region.
 */
Ext.define('Docs.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Docs.view.cls.Container',
        'Docs.view.index.Container',
        'Docs.view.tree.Tree',
        'Docs.view.FavoritesPanel',
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
                                xtype: 'favoritespanel',
                                id: 'classes-tab-panel',
                                region: 'north',
                                height: Docs.Settings.get('favorites-height') || 150,
                                hidden: Docs.Favorites.getCount() === 0
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
                            xtype: 'classcontainer'
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
