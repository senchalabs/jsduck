Ext.define('KitchenSink.model.Restaurant', {
    extend: 'Ext.data.Model',
    fields: ['name', 'cuisine', 'description', {name:'rating', type:'float'}]
});
