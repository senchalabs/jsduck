/**
 * Controller for inline examples.
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Ext.app.Controller',

    init: function() {

    },

    loadIndex: function() {
        Ext.getCmp('card-panel').layout.setActiveItem('examples');
        Ext.getCmp('nested-west-region-container').layout.setActiveItem(1);
    }

});