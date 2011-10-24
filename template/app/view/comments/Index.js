/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.commentindex',

    cls: 'iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    items: [
        { xtype: 'container', html: '<h1>Recent Comments</h1>' },
        { xtype: 'container', id: 'recentcomments' }
    ]
});
