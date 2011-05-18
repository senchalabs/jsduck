Ext.application({
    name: 'Docs',

    appFolder: 'app',

    controllers: [
        'Classes'
    ],

    launch: function() {
        Ext.create('Docs.view.Viewport')
    }
});