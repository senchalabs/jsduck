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
                region: 'north',
                id: 'north-region',
                height: 65,
                width: '100%',
                layout: 'vbox',
                items: [
                    {
                        height: 37,
                        width: '100%',
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'container',
                                html: '<div class="logo"><span>Sencha Docs</span> Ext JS 4.0</div>'
                            },
                            { xtype: 'container', flex: 1 },
                            {
                                cls: 'search',
                                id: 'search-container',
                                width: 200,
                                margin: '3 0 0 0',
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
                            }
                        ]

                    },
                    {
                        xtype: 'container',
                        componentCls: 'doctabs',
                        width: '100%',
                        html: [
                            '<div class="doctab home"><div class="l"></div><div class="m"><a href="#">&nbsp;</a></div><div class="r"></div></div>',
                            '<div class="doctab api"><div class="l"></div><div class="m"><a href="#">&nbsp;</a></div><div class="r"></div></div>',
                            '<div class="doctab videos"><div class="l"></div><div class="m"><a href="#">&nbsp;</a></div><div class="r"></div></div>',
                            '<div class="doctab guides"><div class="l"></div><div class="m"><a href="#">&nbsp;</a></div><div class="r"></div></div>',
                            '<div class="doctab themes"><div class="l"></div><div class="m"><a href="#">&nbsp;</a></div><div class="r"></div></div>',
                            '<div style="position: relative; display: inline-block; width: 8px"></div>',
                            '<div class="doctab"><div class="l"></div><div class="m"><a class="icon-class" href="#/api/Ext.Base">Base</a></div><div class="r"></div></div>',
                            '<div class="doctab"><div class="l"></div><div class="m"><a class="icon-component" href="#/api/Ext.grid.Panel">Grid</a></div><div class="r"></div></div>',
                            '<div class="doctab active"><div class="l"></div><div class="m"><a class="icon-singleton" href="#/api/Ext.Ajax">AJAX</a></div><div class="r"></div></div>',
                            '<div class="doctab"><div class="l"></div><div class="m"><a class="icon-component" href="#/api/Ext.panel.Panel">Panel</a></div><div class="r"></div></div>',
                            '<div class="doctab"><div class="l"></div><div class="m"><a class="icon-component" href="#/api/Ext.form.field.ComboBox">ComboBox</a></div><div class="r"></div></div>'
                        ].join('')
                    }
                ]
            },
            {
                region: 'center',
                layout: 'border',
                minWidth: 800,
                padding: '4 3',
                items: [
                    {
                        region: 'west',
                        id: 'nested-west-region-container',
                        border: 1,
                        layout: 'fit',
                        bodyPadding: '14 9',
                        autoHeight: true,
                        items: [{
                            xtype: 'classtree',
                            width: 220,
                            root: Docs.classData
                        }]
                    },
                    {
                        region: 'center',
                        id: 'center-container',
                        layout: 'fit',
                        minWidth: 800,
                        border: false,
                        padding: '5 10',
                        items: {
                            id: 'card-panel',
                            cls: 'card-panel',
                            xtype: 'container',
                            layout: 'card',
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

                ]
            }
        ];

        // this.items = [
        //     {
        //         width: 240,
        //         id: 'west-region-container',
        //         padding: '5 0 0 0',
        //         layout: 'vbox',
        //         defaults: {
        //             xtype: 'container',
        //             width: "100%"
        //         },
        //         items: [
        //             {
        //                 cls: 'search',
        //                 id: 'search-container',
        //                 margin: '0 0 0 5',
        //                 height: 40,
        //                 items: [
        //                     {
        //                         xtype: 'triggerfield',
        //                         triggerCls: 'reset',
        //                         emptyText: 'Search',
        //                         id: 'search-field',
        //                         enableKeyEvents: true,
        //                         hideTrigger: true,
        //                         onTriggerClick: function() {
        //                             this.reset();
        //                             this.focus();
        //                             this.setHideTrigger(true);
        //                             Ext.getCmp('search-dropdown').hide();
        //                         }
        //                     },
        //                     {
        //                         xtype: 'searchdropdown'
        //                     }
        //                 ]
        //             },
        //             {
        //                 id: 'nested-west-region-container',
        //                 flex: 1,
        //                 layout: 'border',
        //                 border: false,
        //                 items: [
        //                     {
        //                         xtype: 'favoritespanel',
        //                         id: 'classes-tab-panel',
        //                         region: 'north',
        //                         height: Docs.Settings.get('favorites-height') || 150,
        //                         hidden: Docs.Favorites.getCount() === 0
        //                     },
        //                     {
        //                         region: 'center',
        //                         xtype: 'classtree',
        //                         padding: '5 10 0 10',
        //                         margin: '0 5 2 0',
        //                         root: Docs.classData
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         region: 'center',
        //         id: 'center-container',
        //         layout: 'fit',
        //         minWidth: 800,
        //         padding: '20 20 5 0',
        //         items: {
        //             id: 'card-panel',
        //             cls: 'card-panel',
        //             xtype: 'container',
        //             layout: 'card',
        //             padding: '20',
        //             items: [
        //                 {
        //                     autoScroll: true,
        //                     xtype: 'indexcontainer'
        //                 },
        //                 {
        //                     xtype: 'classcontainer'
        //                 },
        //                 {
        //                     autoScroll: true,
        //                     xtype: 'container',
        //                     id: 'guide'
        //                 },
        //                 {
        //                     xtype: 'container',
        //                     id: 'failure'
        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         region: 'south',
        //         id: 'footer',
        //         contentEl: 'footer-content',
        //         height: 15
        //     }
        // ];

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
