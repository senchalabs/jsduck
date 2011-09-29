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
        'Docs.view.auth.Login',
        'Docs.view.Comments',
        'Docs.view.cls.Index',
        'Docs.view.cls.Container',
        'Docs.view.guides.Index',
        'Docs.view.guides.Container',
        'Docs.view.videos.Index',
        'Docs.view.videos.Container',
        'Docs.view.examples.Index',
        'Docs.view.examples.Container',
        'Docs.view.examples.TouchContainer'
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
                                contentEl: 'header-content'
                            },
                            {
                                id: 'loginContainer',
                                xtype: 'authentication',
                                width: 500,
                                padding: '10 20 0 0'
                            },
                            {
                                xtype: 'searchcontainer',
                                id: 'search-container',
                                width: 230,
                                margin: '4 0 0 0'
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
                        width: 240,
                        dockedItems: [
                            {
                                dock: 'bottom',
                                id: 'footer',
                                xtype: 'container',
                                height: 20,
                                contentEl: 'footer-content'
                            }
                        ]
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
                                    xtype: Docs.touchExamplesUi ? 'touchexamplecontainer' : 'examplecontainer',
                                    id: 'example'
                                }
                            ]
                        }
                    }
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
