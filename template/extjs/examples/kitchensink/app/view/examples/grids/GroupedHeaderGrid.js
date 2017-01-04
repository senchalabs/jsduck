Ext.define('KitchenSink.view.examples.grids.GroupedHeaderGrid', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.grid.Panel',
        'KitchenSink.store.Companies'
    ],
    
    items: [
        {
            xtype: 'grid',
            
            title: 'Grouped Header Grid',
            frame: true,
            
            store: 'Companies',

            width: 640,
            height: 400,

            columnLines: true,
            columns: [
                {
                    text     : 'Company',
                    flex     : 1,
                    sortable : false,
                    dataIndex: 'company'
                },
                {
                    text: 'Stock Price',
                    columns: [
                        {
                            text     : 'Price',
                            width    : 75,
                            sortable : true,
                            renderer : 'usMoney',
                            dataIndex: 'price'
                        },
                        {
                            text     : 'Change',
                            width    : 75,
                            sortable : true,
                            renderer : function(val) {
                                if (val > 0) {
                                    return '<span style="color:green;">' + val + '</span>';
                                } else if (val < 0) {
                                    return '<span style="color:red;">' + val + '</span>';
                                }
                                return val;
                            },
                            dataIndex: 'change'
                        },
                        {
                            text     : '% Change',
                            width    : 75,
                            sortable : true,
                            renderer : function(val) {
                                if (val > 0) {
                                    return '<span style="color:green;">' + val + '%</span>';
                                } else if (val < 0) {
                                    return '<span style="color:red;">' + val + '%</span>';
                                }
                                return val;
                            },
                            dataIndex: 'pctChange'
                        }
                    ]
                },
                {
                    text     : 'Last Updated',
                    width    : 95,
                    sortable : true,
                    renderer : Ext.util.Format.dateRenderer('m/d/Y'),
                    dataIndex: 'lastChange'
                }
            ]
        }
    ]
});
