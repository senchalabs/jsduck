/**
 * View for showing users.
 * Either sorted by upvotes or comment count.
 */
Ext.define('Docs.view.comments.Users', {
    alias: "widget.commentsUsers",
    extend: 'Ext.panel.Panel',
    componentCls: "comments-users",
    requires: [
        "Docs.Comments",
        "Docs.view.SimpleSelectBehavior",
        "Docs.view.comments.FilterField"
    ],

    layout: "border",

    /**
     * @event select
     * Fired when user is selected from users list.
     * @param {String} username  The name of the user
     * or undefined when all users were deselected.
     */

    initComponent: function() {
        this.items = [
            this.tabpanel = Ext.widget("tabpanel", {
                plain: true,
                region: "north",
                height: 50,
                items: [
                    {
                        title: "Votes"
                    },
                    {
                        title: "Comments"
                    }
                ],
                dockedItems: [
                    {
                        dock: "bottom",
                        items: [{
                            xtype: "commentsFilterField",
                            emptyText: "Filter users by name...",
                            width: 320,
                            height: 20,
                            listeners: {
                                filter: this.onFilter,
                                scope: this
                            }
                        }]
                    }
                ],
                listeners: {
                    tabchange: this.onTabChange,
                    scope: this
                }
            }),
            this.list = Ext.widget("dataview", {
                region: "center",
                cls: "iScroll users-list",
                autoScroll: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ["userName", "score", "emailHash", "mod"]
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{score}</span>',
                            '{[Docs.Comments.avatar(values.emailHash)]}',
                            '<span class="username <tpl if="mod">moderator</tpl>">{userName}</span>',
                        '</li>',
                    '</tpl>',
                    '</ul>'
                ],
                itemSelector: "li"
            })
        ];

        new Docs.view.SimpleSelectBehavior(this.list, {
            select: this.onSelect,
            deselect: this.onDeselect,
            scope: this
        });

        this.callParent(arguments);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.fetchUsers("votes");
    },

    onTabChange: function(panel, newTab) {
        if (newTab.title === "Votes") {
            this.fetchUsers("votes");
        }
        else {
            this.fetchUsers("comments");
        }
    },

    onFilter: function(pattern) {
        this.list.getSelectionModel().deselectAll();
        this.list.getStore().clearFilter(true);
        this.list.getStore().filter({property: "userName", value: pattern, anyMatch: true});
    },

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.list.getSelectionModel().deselectAll();
    },

    onSelect: function(user) {
        this.selectedUser = user;
        this.fireEvent("select", user.get("userName"));
    },

    onDeselect: function() {
        this.selectedUser = undefined;
        this.fireEvent("select", undefined);
    },

    fetchUsers: function(sortBy) {
        Docs.Comments.request("jsonp", {
            url: '/users',
            method: 'GET',
            params: {
                sortBy: sortBy
            },
            success: this.loadUsers,
            scope: this
        });
    },

    loadUsers: function(users) {
        this.list.getStore().loadData(users.data);
        if (this.selectedUser) {
            var index = this.list.getStore().findExact("userName", this.selectedUser.get("userName"));
            this.list.getSelectionModel().select(index, false, true);
        }
    }
});
