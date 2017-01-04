Ext.define('GeekFlicks.model.Movie', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'title',
        type: 'string'
    }, {
        name: 'year',
        type: 'int'
    }]
});
