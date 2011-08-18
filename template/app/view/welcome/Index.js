/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.welcome.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.welcomeindex',
    requires: [
        'Docs.ContentGrabber'
    ],
    cls: 'welcome iScroll',

    initComponent: function() {
        this.html = Docs.ContentGrabber.get('welcome-content');

        this.callParent(arguments);
    }
});
