/**
 * @author Ed Spencer
 *
 * <p>Small helper class to make creating {@link Ext.data.Store}s from JSON data easier.
 * A JsonStore will be automatically configured with a {@link Ext.data.reader.Json}.</p>
 *
 * <p>A store configuration would be something like:</p>
 *
<pre><code>
var store = new Ext.data.JsonStore({
    // store configs
    storeId: 'myStore',

    proxy: {
        type: 'ajax',
        url: 'get-images.php',
        reader: {
            type: 'json',
            root: 'images',
            idProperty: 'name'
        }
    },

    //alternatively, a {@link Ext.data.Model} name can be given (see {@link Ext.data.Store} for an example)
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
</code></pre>
 *
 * <p>This store is configured to consume a returned object of the form:<pre><code>
{
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
}
</code></pre>
 *
 * <p>An object literal of this form could also be used as the {@link #cfg-data} config option.</p>
 */
Ext.define('Ext.data.JsonStore',  {
    extend: 'Ext.data.Store',
    alias: 'store.json',
    requires: [
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json',
        'Ext.data.writer.Json'
    ],

    constructor: function(config) {
        config = Ext.apply({
            proxy: {
                type  : 'ajax',
                reader: 'json',
                writer: 'json'
            }
        }, config);
        this.callParent([config]);
    }
});