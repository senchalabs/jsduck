/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Videos', {
    extend: 'Ext.app.Controller',

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/videos');
        Ext.getCmp('card-panel').layout.setActiveItem('videos');
        Ext.getCmp('tree-container').hide();
    }
});
