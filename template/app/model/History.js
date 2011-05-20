/**
 * Previously visited classes / guides
 */
Ext.define('Docs.model.History', {
    fields: ['id', 'cls', 'scrollPosision', 'hideInherited', 'expandedMembers'],
    extend: 'Ext.data.Model',
    proxy: {
        type: 'localstorage',
        id  : 'docs-history'
    }
});