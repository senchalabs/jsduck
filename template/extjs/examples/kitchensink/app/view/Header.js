Ext.define('KitchenSink.view.Header', {
    extend: 'Ext.Toolbar',
    xtype : 'pageHeader',
    
    ui   : 'sencha',
    height: 53,
    
    items: [
        {
            xtype: 'component',
            cls  : 'x-logo',
            html : 'Ext JS 4.1 Kitchen Sink'
        }
    ]
});
