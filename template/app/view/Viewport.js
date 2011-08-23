/**
 * The main viewport, split in to a west and center region.
 */
Ext.define('Docs.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Docs.view.search.Container',
        'Docs.view.Tabs',
        'Docs.view.TreeContainer',
        'Docs.view.welcome.Index',
        'Docs.view.cls.Index',
        'Docs.view.cls.Container',
        'Docs.view.guides.Index',
        'Docs.view.guides.Container',
        'Docs.view.videos.Index',
        'Docs.view.videos.Container',
        'Docs.view.examples.Index'
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
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        height: 37,
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'container',
                                flex: 1,
                                html: '<div class="logo"><span>Sencha Docs</span> Ext JS 4.0</div>'
                            },
                            {
                                xtype: 'searchcontainer',
                                id: 'search-container',
                                width: 230,
                                margin: '5 0 0 0'
                            }
                        ]

                    },
                    {
                        xtype: 'doctabs'
                    }
                ]
            },
            {
                region: 'center',
                layout: 'border',
                minWidth: 800,
                items: [
                    {
                        region: 'west',
                        xtype: 'treecontainer',
                        id: 'treecontainer',
                        border: 1,
                        bodyPadding: '10 9 4 9',
                        width: 240
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
                            layout: {
                                type: 'card',
                                deferredRender: true
                            },
                            items: [
                                {
                                    autoScroll: true,
                                    xtype: 'welcomeindex',
                                    id: 'welcomeindex'
                                },
                                {
                                    xtype: 'container',
                                    id: 'failure'
                                },
                                {
                                    autoScroll: true,
                                    xtype: 'classindex',
                                    id: 'classindex'
                                },
                                {
                                    xtype: 'classcontainer',
                                    id: 'classcontainer'
                                },
                                {
                                    autoScroll: true,
                                    xtype: 'guideindex',
                                    id: 'guideindex'
                                },
                                {
                                    autoScroll: true,
                                    xtype: 'guidecontainer',
                                    id: 'guide',
                                    cls: 'iScroll'
                                },
                                {
                                    xtype: 'videoindex',
                                    id: 'videoindex'
                                },
                                {
                                    xtype: 'videocontainer',
                                    id: 'video'
                                },
                                {
                                    xtype: 'exampleindex',
                                    id: 'exampleindex'
                                },
                                {
                                    id: 'example',
                                    xtype: 'container',
                                    layout: 'fit',
                                    html: '<iframe style="width: 100%; height: 100%; border: 0;" id="exampleIframe" src="egIframe.html"></iframe>'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                region: 'south',
                id: 'footer',
                height: 20,
                contentEl: 'footer-content'
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
