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
        'Docs.view.comments.Targets',
        'Docs.view.comments.Tags'
    ],
    componentCls: 'comments-index',

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
                },
                {
                    xtype: "commentsTags"
                }
            ]
        }
    ],

    initComponent: function() {
        this.callParent(arguments);

        var cardPanel = this.down("#cardPanel");
        var users = this.down("commentsUsers");
        var targets = this.down("commentsTargets");
        var tags = this.down("commentsTags");

        this.down("commentsHeaderMenu").on("select", function(item) {
            if (item === "users") {
                targets.deselectAll();
                tags.deselectAll();
                cardPanel.getLayout().setActiveItem(users);
            }
            else if (item === "targets") {
                users.deselectAll();
                tags.deselectAll();
                cardPanel.getLayout().setActiveItem(targets);
            }
            else {
                users.deselectAll();
                targets.deselectAll();
                cardPanel.getLayout().setActiveItem(tags);
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
