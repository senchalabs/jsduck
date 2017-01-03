Ext.define('GeekFlicks.store.Movies', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    fields: ['title', 'year'],
    proxy: {
        type: 'ajax',
        url: 'movies.php',
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
    /*data: [{
        title: 'The Matrix',
        year: '1999'
    }, {
        title: 'Star Wars: Return of the Jedi',
        year: '1983'
    }]*/
});
