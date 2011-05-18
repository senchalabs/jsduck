/**
 * The main viewport, split in to a west and center region. 
 * The North region should also be shown by default in the packaged 
 * (non-live) version of the docs. TODO: close button on north region.
 */
Ext.define('Docs.view.Viewport', {
    
    extend: 'Ext.container.Viewport',
    
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
                padding: '5 0 10 20',
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
                            }
                        }
                    },
                    {
                        cls: 'search',
                        height: 40
                    },
                    {
                        flex: 1,
                        xtype: 'classtree',
                        root: Docs.classData
                    }
                ]
            },
            {
                region: 'center',
                id: 'center-container',
                layout: 'fit',
                items: {
                    id: 'container',
                    xtype: 'container',
                    layout: 'card',
                    padding: '20',
                    cls: 'container',
                    items: [
                        {
                            autoScroll: true,
                            xtype: 'classlist',
                            classData: Docs.overviewData
                        },
                        Ext.create('Docs.view.class.Show'),
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