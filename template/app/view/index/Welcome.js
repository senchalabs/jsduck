/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.index.Welcome', {
    extend: 'Ext.container.Container',
    alias : 'widget.welcomecontainer',
    id : 'welcome',
    cls: 'welcome',

    html: '<img src="resources/images/welcome.jpg" style="display: block; margin: 10px auto 0 auto;" />'
});
