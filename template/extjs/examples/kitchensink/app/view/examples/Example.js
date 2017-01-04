Ext.define('KitchenSink.view.examples.Example', {
    extend: 'Ext.Container',
    requires: [
        'Ext.layout.container.VBox'
    ],
    
    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    
    defaults: {
        width: 400,
        height: 295
    }
});
