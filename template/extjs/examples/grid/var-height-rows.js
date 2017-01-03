Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.PagingScroller'
]);

Ext.define('Employee', {
    extend: 'Ext.data.Model',
    fields: [
       {name: 'rating', type: 'int'},
       {name: 'salary', type: 'float'},
       {name: 'name'},
       'rowHeight'
    ]
});

Ext.onReady(function(){
    /**
     * Returns an array of fake data
     * @param {Number} count The number of fake rows to create data for
     * @return {Array} The fake record data, suitable for usage with an ArrayReader
     */
    function createFakeData(count) {
        var firstNames   = ['Ed', 'Tommy', 'Aaron', 'Abe', 'Jamie', 'Adam', 'Dave', 'David', 'Jay', 'Nicolas', 'Nige'],
            lastNames    = ['Spencer', 'Maintz', 'Conran', 'Elias', 'Avins', 'Mishcon', 'Kaneda', 'Davis', 'Robinson', 'Ferrero', 'White'],
            ratings      = [1, 2, 3, 4, 5],
            salaries     = [100, 400, 900, 1500, 1000000];

        var data = [];
        for (var i = 0; i < (count || 25); i++) {
            var ratingId    = Math.floor(Math.random() * ratings.length),
                salaryId    = Math.floor(Math.random() * salaries.length),
                firstNameId = Math.floor(Math.random() * firstNames.length),
                lastNameId  = Math.floor(Math.random() * lastNames.length),

                rating      = ratings[ratingId],
                salary      = salaries[salaryId],
                name        = Ext.String.format("{0} {1}", firstNames[firstNameId], lastNames[lastNameId]);

            data.push({
                rating: rating,
                salary: salary,
                name: name,
                rowHeight: (i == count - 1) ? 150 : Ext.Number.randomInt(21, 50)
            });
        }
        return data;
    }
    // create the Data Store
    var store = Ext.create('Ext.data.Store', {
        id: 'store',
        pageSize: 50000,
        // allow the grid to interact with the paging scroller by buffering
        buffered: true,
        // never purge any data, we prefetch all up front
        purgePageCount: 0,
        model: 'Employee',
        proxy: {
            type: 'memory'
        }
    });

    var grid = Ext.create('Ext.grid.Panel', {
        width: 700,
        height: 500,
        title: 'Bufffered Grid of 50,000 random records',
        store: store,
        verticalScroller: {
            variableRowHeight: true
        },
        loadMask: true,
        selModel: {
            pruneRemoved: false,
            selectionMode: 'MULTI'
        },
        viewConfig: {
            trackOver: false
        },
        // grid columns
        columns:[{
            xtype: 'rownumberer',
            width: 40,
            sortable: false,
            xhooks: {
                renderer: function(v, meta, record) {
                    meta.tdAttr = 'style="vertical-align:center;height:' + record.data.rowHeight + 'px"';
                    return this.callParent(arguments);
                }
            }
        },{
            text: 'Name',
            flex:1 ,
            sortable: true,
            dataIndex: 'name'
        },{
            text: 'Rating',
            width: 125,
            sortable: true,
            dataIndex: 'rating'
        },{
            text: 'Salary',
            width: 125,
            sortable: true,
            dataIndex: 'salary',
            align: 'right',
            renderer: Ext.util.Format.usMoney
        }],
        renderTo: Ext.getBody()
    });

    var data = createFakeData(49679),
        ln = data.length,
        records = [],
        i = 0;
    for (; i < ln; i++) {
        records.push(Ext.create('Employee', data[i]));
    }

    // Load data as a single, 50000 record page, only render 50 rows.
    store.cachePage(records, 1);
    store.guaranteeRange(0, 49);
});
