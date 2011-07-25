/**
 * Main application definition for Docs app.
 *
 * We define our own Application class because this way we can also
 * easily define the dependencies.
 */
Ext.define('Docs.Application', {
    extend: 'Ext.app.Application',
    name: 'Docs',

    requires: [
        'Docs.Favorites',
        'Docs.History',
        'Docs.Settings'
    ],

    uses: [
        'Ext.util.History',
        'Ext.data.JsonP'
    ],

    controllers: [
        'Classes',
        'Search',
        'Examples',
        'Favorites'
    ],

    launch: function() {
        Docs.App = this;
        Docs.Favorites.init();
        Docs.Settings.init();

        Ext.create('Docs.view.Viewport');

        // Update favorites grid height between browser tabs if changed
        Ext.getStore('Settings').on('load', function(store) {
            var favHeight = Docs.Settings.get('favorites-height');
            if (favHeight) {
                var tabPanel = Ext.getCmp('classes-tab-panel');
                tabPanel.suspendEvents();
                tabPanel.setHeight(favHeight);
                tabPanel.resumeEvents();
            }
        });

        Docs.History.init();

        // When google analytics event tracking script present on page
        if (Docs.initEventTracking) {
            Docs.initEventTracking();
        }
    }

});
