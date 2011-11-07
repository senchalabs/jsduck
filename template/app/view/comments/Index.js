/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.commentindex',

    cls: 'comment-index iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    items: [
        { xtype: 'container', html: '<h1>Recent Comments</h1>' },
        { xtype: 'container', id: 'recentcomments' }
    ],

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
