Ext.application({
    name: "GeekFlicks",
    appFolder: "app",
    controllers: ['Movies'],
    launch: function () {
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [{
                xtype: 'panel',
                title: 'Top Geek Flicks of All Time',
                items: [{
                    xtype: 'movieseditor'
                }]
            }]
        });
    }
});
