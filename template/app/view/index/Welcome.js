/**
 * List of classes on front page.
 * Together with links to guides and icons legend.
 */
Ext.define('Docs.view.index.Welcome', {
    extend: 'Ext.container.Container',
    alias : 'widget.welcomecontainer',
    id : 'welcome',
    cls: 'welcome',

    html: '<img src="resources/images/welcome.jpg" style="display: block; margin: 10px auto 0 auto;" />'
});
