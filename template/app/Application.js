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
        'Docs.History',
        'Docs.Settings'
    ],

    uses: [
        'Ext.util.History',
        'Ext.data.JsonP'
    ],

    controllers: [
        'Auth',
        'Welcome',
        'Failure',
        'Classes',
        'Comments',
        'CommentsMeta',
        'Search',
        'InlineExamples',
        'Examples',
        'Guides',
        'Videos',
        'Stats',
        'Tabs',
        'DocTests'
    ],

    launch: function() {
        Docs.App = this;
        Docs.Settings.init();

        Ext.create('Docs.view.Viewport');

        Docs.History.init();

        // When google analytics event tracking script present on page
        if (Docs.initEventTracking) {
            Docs.initEventTracking();
        }

        // Remove loading animated gif from background.
        // Keeping it there will degrade performance.
        Ext.get("loading").remove();

        // setInterval(function(){
        //     Ext.DomQuery.select('link')[2].href = "resources/css/viewport.css?" + Math.ceil(Math.random() * 100000000)
        // }, 1000);
    }
});
