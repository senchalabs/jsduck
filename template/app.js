Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Docs': 'app'
    }
});

/**
 * @class Docs.App
 * @extends Ext.app.Application
 *
 * Main application definition for Docs app. Defines a 'Docs' namespace under
 * which all models, views, controllers, stores, helpers etc should be defined.
 */
Ext.application({
    name: 'Docs',

    appFolder: 'app',

    controllers: [
        'Classes',
        'Search'
    ],

    autoCreateViewport: true,

    launch: function() {
        Docs.App = this;
        Docs.History.init();
        this.getStore('History').load(); // Load History from localStorage
    }
});
