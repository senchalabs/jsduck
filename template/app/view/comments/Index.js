/**
 * Container for recent comments and top users.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],
    requires: [
        'Docs.view.comments.List',
        'Docs.view.comments.Users',
        'Docs.view.comments.Targets'
    ],

    cls: 'comment-index',
    margin: '10 0 0 0',
    layout: 'border',

    items: [
        {
            region: "center",
            xtype: "commentslist"
        },
        {
            region: "east",
            xtype: "commentstargets",
            width: 300,
            margin: '0 0 0 20'
        }
    ],

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
