/**
 * Store for keeping Docs app settings
 */
Ext.define('Docs.store.Settings', {
    extend: 'Ext.data.Store',
    requires: ['Docs.model.Setting'],
    model: 'Docs.model.Setting'
});
