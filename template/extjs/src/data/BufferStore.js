/**
 * @private
 */
Ext.define('Ext.data.BufferStore', {
    extend: 'Ext.data.Store',
    alias: 'store.buffer',
    sortOnLoad: false,
    filterOnLoad: false,
    
    constructor: function() {
        Ext.Error.raise('The BufferStore class has been deprecated. Instead, specify the buffered config option on Ext.data.Store');
    }
});