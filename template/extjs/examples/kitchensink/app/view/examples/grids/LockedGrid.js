Ext.define('KitchenSink.view.examples.grids.LockedGrid', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.grid.Panel'
    ],

    items: [
        {
            xtype: 'grid',
            
            title: 'Restaurant Reviews',
            frame: true,
            width: 500,
            height: 400,
            
            store: 'Restaurants',
            
            columns: [
                {
                    text: 'Name',
                    width: 150,
                    dataIndex: 'name',
                    locked: true
                },
                { 
                    text: 'Rating',
                    width: 70,
                    sortable: false,
                    dataIndex: 'rating',
                    renderer: function(rating) {
                        return Array(Math.ceil(rating) + 1).join('&#x272D;');
                    }
                },
                { text: 'Cuisine', width: 90, dataIndex: 'cuisine' },
                { text: 'Review', width: 400, flex: 1, dataIndex: 'description', sortable: false }
            ]
        }
    ]
});
