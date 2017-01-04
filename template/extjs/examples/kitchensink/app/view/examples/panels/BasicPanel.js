Ext.define('KitchenSink.view.examples.panels.BasicPanel', {
    extend: 'KitchenSink.view.examples.PanelExample',

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
                    xtype: 'panel',
                    html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis         lacinia tortor.'
                },
                {
                    xtype: 'panel',
                    title: 'Title',
                    html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis         lacinia tortor.'
                },
                {
                    xtype: 'panel',
                    title: 'Header Icons',
                    tools: [
                        {type:'pin'},
                        {type:'refresh'},
                        {type:'search'},
                        {type:'save'}
                    ],
                    html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis         lacinia tortor.'
                }
            ]
        },
        {
            xtype: 'panel',
            title: 'Collapsed Panel',
            collapsed: true,
            collapsible: true,
            width: 640,
            bodyPadding: 10,
            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis lacinia tortor.'
        }
    ]
});
