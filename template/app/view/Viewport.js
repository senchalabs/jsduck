/**
 * The main viewport, split in to a west and center region.
 */
Ext.define('Docs.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Docs.view.search.Container',
        'Docs.view.Tabs',
        'Docs.view.index.Welcome',
        'Docs.view.cls.Index',
        'Docs.view.cls.Container',
        'Docs.view.cls.Tree',
        'Docs.view.guides.Index',
        'Docs.view.guides.Tree',
        'Docs.view.videos.Index',
        'Docs.view.videos.Tree',
        'Docs.view.examples.Index',
        'Docs.view.examples.Tree'
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
                padding: '4 3',
                items: [
                    {
                        region: 'west',
                        id: 'tree-container',
                        cls: 'iScroll',
                        border: 1,
                        layout: 'card',
                        resizable: true,
                        resizeHandles: 'e',
                        collapsible: true,
                        hideCollapseTool: true,
                        animCollapse: true,
                        bodyPadding: '14 9',
                        width: 240,
                        items: [
                            {
                                xtype: 'classtree',
                                id: 'classtree',
                                root: Docs.data.classes
                            },
                            {
                                xtype: 'exampletree',
                                id: 'exampletree'
                            },
                            {
                                xtype: 'guidetree',
                                id: 'guidetree'
                            },
                            {
                                xtype: 'videotree',
                                id: 'videotree'
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
                            layout: 'card',
                            deferredRender: true,
                            items: [
                                {
                                    autoScroll: true,
                                    xtype: 'welcomecontainer'
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
                                    id: 'guides'
                                },
                                {
                                    autoScroll: true,
                                    xtype: 'container',
                                    id: 'guide',
                                    cls: 'iScroll'
                                },
                                {
                                    xtype: 'container',
                                    id: 'failure'
                                },
                                {
                                    xtype: 'examplesindex',
                                    id: 'examples'
                                },
                                {
                                    id: 'example',
                                    xtype: 'container',
                                    layout: 'fit',
                                    html: '<iframe style="width: 100%; height: 100%; border: 0;" id="exampleIframe" src="egIframe.html"></iframe>'
                                },
                                {
                                    xtype: 'videoindex',
                                    id: 'videos'
                                },
                                {
                                    xtype: 'container',
                                    id: 'video',
                                    html: '<iframe id="videoplayer" src="egIframe.html" width="640" height="360" frameborder="0" style="margin: 15px;"></iframe>'
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
