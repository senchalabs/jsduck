/**
 * Container for recent comments and top users.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],
    requires: [
        'Docs.view.comments.FullList',
        'Docs.view.comments.HeaderMenu',
        'Docs.view.comments.Users',
        'Docs.view.comments.Targets'
    ],

    cls: 'comment-index',
    margin: '10 0 0 0',
    layout: 'border',

    items: [
        {
            region: "center",
            xtype: "commentsFullList"
        },
        {
            region: "east",
            itemId: "cardPanel",
            layout: "border",
            width: 300,
            margin: '0 0 0 20',
            layout: "card",
            dockedItems: [
                {
                    xtype: 'commentsHeaderMenu',
                    dock: "top",
                    height: 35
                }
            ],
            items: [
                {
                    xtype: "commentsUsers"
                },
                {
                    xtype: "commentsTargets"
                }
            ]
        }
    ],

    initComponent: function() {
        this.callParent(arguments);

        var cardPanel = this.down("#cardPanel");
        var users = this.down("commentsUsers");
        var targets = this.down("commentsTargets");
        this.down("commentsHeaderMenu").on("select", function(item) {
            if (item === "users") {
                targets.deselectAll();
                cardPanel.getLayout().setActiveItem(users);
            }
            else {
                users.deselectAll();
                cardPanel.getLayout().setActiveItem(targets);
            }
        }, this);
    },

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
