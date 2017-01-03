Ext.define('KitchenSink.view.examples.grids.BasicGrid', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.grid.Panel',
        'KitchenSink.store.Restaurants'
    ],
    
    items: [
        {
            xtype: 'grid',
            
            title: 'Restaurants',
            frame: true,
            
            store: 'Restaurants',
            
            columns: [
                { text: 'Name', flex: 1, dataIndex: 'name' },
                { text: 'Cuisine', flex: 1, dataIndex: 'cuisine' }
            ]
        }
    ]
});
