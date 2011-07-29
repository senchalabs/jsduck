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
        'Docs.view.Tabs',
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
                                width: 230,
                                margin: '5 0 0 0',
                                items: [
                                    {
                                        xtype: 'triggerfield',
                                        triggerCls: 'reset',
                                        emptyText: 'Search',
                                        width: 170,
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
                        xtype: 'doctabs',
                        width: '100%'
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
