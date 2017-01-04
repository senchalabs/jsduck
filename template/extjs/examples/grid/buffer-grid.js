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
       {name: 'name'}
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
                name: name
            });
        }
        return data;
    }

    // Create the Data Store.
    // Because it is buffered, the automatic load will be directed
    // through the prefetch mechanism, and be read through the page cache
    var store = Ext.create('Ext.data.Store', {
        id: 'store',
        // allow the grid to interact with the paging scroller by buffering
        buffered: true,
        // Configure the store with a single page of records which will be cached
        pageSize: 5000,
        data: createFakeData(5000),
        model: 'Employee',
        proxy: {
            type: 'memory'
        }
    });

    var grid = Ext.create('Ext.grid.Panel', {
        width: 700,
        height: 500,
        title: 'Bufffered Grid of 5,000 random records',
        store: store,
        loadMask: true,
        selModel: {
            pruneRemoved: false
        },
        viewConfig: {
            trackOver: false
        },
        // grid columns
        columns:[{
            xtype: 'rownumberer',
            width: 40,
            sortable: false
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
});