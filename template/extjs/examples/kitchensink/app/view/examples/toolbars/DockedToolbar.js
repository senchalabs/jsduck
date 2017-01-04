(function() {
    var toolbarItems = [
        {iconCls:'list'},
        '-',
        {iconCls:'close'},
        {iconCls:'paste'},
        '-',
        {iconCls:'edit2'}
    ];

    Ext.define('KitchenSink.view.examples.toolbars.DockedToolbar', {
        extend: 'KitchenSink.view.examples.PanelExample',
        requires: [
            'Ext.layout.container.HBox',
            'Ext.toolbar.Toolbar'
        ],

        items: [
            {
                xtype: 'panel',

                style: 'background:transparent',
                bodyStyle: 'background:transparent',

                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },

                items: [
                    {
                        title: 'Top',
                        xtype: 'panel',
                        dockedItems: [{dock:'top', xtype:'toolbar', items: toolbarItems}],
                        html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
                    },
                    {
                        title: 'Right',
                        xtype: 'panel',
                        dockedItems: [{dock:'right', xtype:'toolbar', items: toolbarItems}],
                        html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
                    }
                ]
            },
            {
                xtype: 'panel',

                style: 'background:transparent',
                bodyStyle: 'background:transparent',

                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },

                items: [
                    {
                        title: 'Left',
                        xtype: 'panel',
                        dockedItems: [{dock:'left', xtype:'toolbar', items: toolbarItems}],
                        html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
                    },
                    {
                        title: 'Bottom',
                        xtype: 'panel',
                        dockedItems: [{dock:'bottom', xtype:'toolbar', items: toolbarItems}],
                        html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
                    }
                ]
            }
        ]
    });
})();
