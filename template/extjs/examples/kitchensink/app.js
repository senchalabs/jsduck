Ext.application({
    name: 'KitchenSink',

    autoCreateViewport: true,
    
    requires: [
        'Ext.window.MessageBox'
    ],

    controllers: [
        'Main'
    ],
    
    launch: function(){
        if (!Ext.isWebKit) {
            Ext.MessageBox.alert('WebKit Only', 'This example is currently only supported in WebKit browsers');
        }
    }
});
