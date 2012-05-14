/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.welcome.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.welcomeindex',
    mixins: ['Docs.view.Scrolling'],
    requires: [
        'Docs.ContentGrabber'
    ],
    cls: 'welcome iScroll',

    initComponent: function() {
        this.html = Docs.ContentGrabber.get('welcome-content');
        this.hasContent = !!this.html;

        this.callParent(arguments);
    },

    /**
     * Returns tab config for the welcome page.
     * @return {Object}
     */
    getTab: function() {
        return this.hasContent ? {cls: 'index', href: '#', tooltip: 'Home'} : false;
    }
});
