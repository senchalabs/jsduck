/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.index.Welcome', {
    extend: 'Ext.container.Container',
    alias : 'widget.welcomecontainer',
    id : 'welcome',
    cls: 'welcome',

    html: [
        '<img src="resources/images/welcome.jpg" style="display: block; margin: 10px auto 0 auto;" />',
        '<h2>SDK News</h2>',
        '<div>July 24, 2011. Ext 4.0.5 Released (support subscribers only)</div>',
        '<div>June 29, 2011. Ext 4.0.4 Released (support subscribers only)</div>',
        '<div>June 14, 2011. Ext 4.0.3 Released (support subscribers only)</div>',
        '<div>June 9, 2011. Ext 4.0.2a Released</div>',
        '<div>May 17, 2011. Ext 4.0.1 Released</div>',
        '<div>April 26, 2011. Ext 4.0.0 Final Released</div>',
        '<div>April 14, 2011. Ext 4 Beta 3 Released</div>',
        '<div>April 6, 2011. Ext 4 Beta 2 Released</div>',
        '<div>March 30, 2011. Ext 4 Beta 1 Released</div>',
        '<div>March 18, 2011. Ext 4 PR 5 Released</div>',
        '<div>March 15, 2011. Ext 4 PR 4 Released</div>',
        '<div>March 3, 2011. Ext 4 PR 3 Released</div>',
        '<div>February 23, 2011. Ext 4 PR 2 Released</div>',
        '<div>February 16, 2011. Ext 4 PR 1 Released</div>'
    ]
});
