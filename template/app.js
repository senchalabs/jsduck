/**
 * Main application definition for Docs app. Defines a 'Docs' namespace under
 * which all models, views, controllers, stores, helpers etc should be defined.
 */
Ext.application({
    name: 'Docs',

    appFolder: 'app',

    controllers: [
        'Classes'
    ],

    launch: function() {
        Ext.create('Docs.view.Viewport');
    }
});
