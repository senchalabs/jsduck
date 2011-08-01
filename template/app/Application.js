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
        'InlineExamples',
        'Examples',
        'Favorites',
        'Guides',
        'Videos',
        'Tabs'
    ],

    launch: function() {
        Docs.App = this;
        Docs.Favorites.init();
        Docs.Settings.init();
        Docs.classState = {};

        Ext.create('Docs.view.Viewport');

        Docs.History.init();

        // When google analytics event tracking script present on page
        if (Docs.initEventTracking) {
            Docs.initEventTracking();
        }

        setInterval(function(){
            Ext.DomQuery.select('link')[4].href = "resources/css/viewport.css?" + Math.ceil(Math.random() * 100000000)
        }, 1000)
    }

});
