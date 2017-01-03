Ext.define('KitchenSink.view.examples.grids.GroupedGrid', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.feature.Grouping',
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
            ],
            
            features: [{
                ftype: 'grouping',
                hideGroupedHeader: true,
                groupHeaderTpl: 'Cuisine: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
            }]
        }
    ]
});
