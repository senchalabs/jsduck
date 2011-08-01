/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Index', {
    extend: 'Ext.app.Controller',

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#');
        Ext.getCmp('card-panel').layout.setActiveItem('welcome');
        Ext.getCmp('tree-container').hide();
    }
});
