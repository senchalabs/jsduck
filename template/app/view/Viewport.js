/**
 * The main viewport, split in to a west and center region.
 */
Ext.define('Docs.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Docs.view.search.Container',
        'Docs.view.Header',
        'Docs.view.Tabs',
        'Docs.view.TreeContainer',
        'Docs.view.welcome.Index',
        'Docs.view.auth.Login',
        'Docs.view.comments.Index',
        'Docs.view.Comments',
        'Docs.view.cls.Index',
        'Docs.view.cls.Container',
        'Docs.view.guides.Index',
        'Docs.view.guides.Container',
        'Docs.view.videos.Index',
        'Docs.view.videos.Container',
        'Docs.view.examples.Index',
        'Docs.view.examples.Container',
        'Docs.view.examples.TouchContainer',
        'Docs.view.stats.Index',
        'Docs.view.tests.Index'
    ],

    id: 'viewport',
    layout: 'border',
    defaults: { xtype: 'container' },

    initComponent: function() {

        this.items = [
            {
                region: 'north',
                id: 'north-region',
				// Ti changed height
                height: 78,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
					// Ti change -- removed login container, adjusted height
					{
						xtype: 'container',
                        id: 'doc-topnav-container',
						height: 50,
						layout: 'hbox',
						items: [
                            { 
                                xtype: 'component',
                                id: 'doc-logo',
                                html: '<span>Documentation</span>',
                                width: 170,
                                height: 30,
                            },
							{
								xtype: 'docheader',
                                margin: '12 0 0 0'
							},
							{   xtype: 'container', flex: 1 },
						   {
							   xtype: 'searchcontainer',
							   id: 'search-container',
							   width: 224,
							   margin: '12 0 0 0'
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
						// Ti changed width
                        width: 224
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
                                    autoScroll: true,
                                    xtype: 'videocontainer',
                                    id: 'video',
                                    cls: 'iScroll'
                                },
                                {
                                    xtype: 'exampleindex',
                                    id: 'exampleindex'
                                },
                                {
                                    xtype: Docs.data.touchExamplesUi ? 'touchexamplecontainer' : 'examplecontainer',
                                    id: 'example'
                                },
                                {
                                    xtype: 'statsindex',
                                    id: 'statsindex'
                                },
                                {
                                    xtype: 'testsindex',
                                    id: 'testsindex'
                                },
                                {
                                    xtype: 'commentindex',
                                    id: 'commentindex'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                region: 'south',
                id: 'footer',
				// Ti changed height. 
                height: 76,
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
