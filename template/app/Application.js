/**
 * Launcher of the Docs app.
 *
 * To have greater control of all the dependencies and do some
 * additional setup before launching the actual Ext.app.Application
 * instance we're not using the basic Ext.application().
 */
Ext.define('Docs.Application', {
    requires: [
        'Ext.app.Application',
        'Docs.History',
        'Docs.Comments',
        'Docs.Settings',
        'Docs.view.Viewport',

        'Docs.controller.Auth',
        'Docs.controller.Welcome',
        'Docs.controller.Failure',
        'Docs.controller.Classes',
        'Docs.controller.Search',
        'Docs.controller.InlineExamples',
        'Docs.controller.Examples',
        'Docs.controller.Guides',
        'Docs.controller.Videos',
        'Docs.controller.Tabs',
        'Docs.controller.Comments',
        'Docs.controller.CommentCounts',
        'Docs.controller.Tests'
    ],

    constructor: function() {
        // Initialize the comments system before anything else.
        //
        // This way all the controllers and views can rely on the
        // basic comments data being already loaded and they don't
        // need to set up additional listeners and callback to wait
        // for it being loaded.
        Docs.Comments.init(this.createApp, this);
    },

    createApp: function() {
        new Ext.app.Application({
            name: "Docs",
            controllers: [
                'Auth',
                'Welcome',
                'Failure',
                'Classes',
                'Search',
                'InlineExamples',
                'Examples',
                'Guides',
                'Videos',
                'Tabs',
                'Comments',
                'CommentCounts',
                'Tests'
            ],
            launch: this.launch
        });
    },

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
        //     Ext.DomQuery.select('link')[2].href = "resources/css/viewport.css?" + Math.ceil(Math.random() * 100000000);
        // }, 1000);
    }
});
