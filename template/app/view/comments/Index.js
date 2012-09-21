/**
 * Container for recent comments and top users.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],
    requires: [
        'Docs.view.comments.List',
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
            xtype: "commentslist"
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
                    xtype: "commentsusers"
                },
                {
                    xtype: "commentstargets"
                }
            ]
        }
    ],

    initComponent: function() {
        this.callParent(arguments);

        var cardPanel = this.down("#cardPanel");
        var users = this.down("commentsusers");
        var targets = this.down("commentstargets");
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
