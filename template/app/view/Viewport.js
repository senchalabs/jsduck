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
        'Docs.view.ClassGrid',
        'Docs.Favorites',
        'Docs.History'
    ],

    id: 'viewport',
    layout: 'border',
    defaults: { xtype: 'container' },

    initComponent: function() {
        this.items = [

            // This is the 'live docs' header that should appear in the distributed version of the docs
            // {
            //     region: 'north',
            //     layout: 'fit',
            //     cls: 'notice',
            //     html: 'For up to date documentation and features, visit <a href="http://docs.sencha.com/ext-js/4-0">http://docs.sencha.com/ext-js/4-0</a>',
            //     height: 33
            // },

            {
                region:'west',
                width: 240,
                id: 'west-region-container',
                padding: '5 0 20 20',
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
                        margin: '0 0 10 0',
                        width: 220,
                        border: 0,
                        ui: 'hmm',
                        listeners: {
                            click: function() {
                                Ext.getCmp('container').layout.setActiveItem(0);
                                Docs.History.push("");
                            }
                        }
                    },
                    {
                        cls: 'search',
                        id: 'search-container',
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
                                xtype: 'tabpanel',
                                region: 'north',
                                height: 150,
                                plain: true,
                                split: true,
                                items: [
                                    {
                                        xtype: 'classgrid',
                                        id: 'favorites-grid',
                                        title: 'Favorites',
                                        store: Ext.getStore('Favorites'),
                                        icons: Docs.icons,
                                        listeners: {
                                            closeclick: function(cls) {
                                                Docs.Favorites.remove(cls);
                                            }
                                        }
                                    },
                                    {
                                        xtype: 'classgrid',
                                        id: 'history-grid',
                                        title: 'History',
                                        store: Ext.getStore('History'),
                                        icons: Docs.icons,
                                        listeners: {
                                            closeclick: function(cls) {
                                                Docs.History.removeClass(cls);
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                region: 'center',
                                xtype: 'classtree',
                                margin: '3 0 0 0',
                                root: Docs.classData
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
                items: {
                    id: 'container',
                    xtype: 'container',
                    layout: 'card',
                    padding: '20',
                    cls: 'container',
                    items: [
                        {
                            autoScroll: true,
                            xtype: 'indexcontainer',
                            classData: Docs.overviewData
                        },
                        {
                            xtype: 'classcontainer'
                        },
                        {
                            autoScroll: true,
                            xtype: 'container',
                            id: 'guide'
                        }
                    ]
                }
            }
        ];

        this.callParent(arguments);
    }
});
