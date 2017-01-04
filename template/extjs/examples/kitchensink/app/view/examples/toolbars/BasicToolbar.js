Ext.define('KitchenSink.view.examples.toolbars.BasicToolbar', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.button.Split',
        'Ext.toolbar.Toolbar'
    ],

    items: [
        {
            xtype:'toolbar',
            width:null, height:null,
            items:[
                {xtype:'splitbutton', text:'Menu Button', iconCls:'list', menu:[
                    {text:'Menu Button 1'}
                ]},
                '-',
                {xtype:'splitbutton', text:'Cut', iconCls:'close', menu:[
                    {text:'Cut Menu Item'}
                ]},
                {text:'Copy', iconCls:'file'},
                {text:'Paste', iconCls:'paste', menu:[
                    {text:'Paste Menu Item'}
                ]},
                '-',
                {text:'Format', iconCls:'edit2'}
            ]
        }
    ]
});
