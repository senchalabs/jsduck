/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Guides', {
    extend: 'Ext.app.Controller',

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/guides');
        Ext.getCmp('card-panel').layout.setActiveItem('guides');
        Ext.getCmp('tree-container').hide();
    }
});
