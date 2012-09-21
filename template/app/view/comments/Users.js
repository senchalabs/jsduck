/**
 * View for showing users.
 * Either sorted by upvotes or comment count.
 */
Ext.define('Docs.view.comments.Users', {
    alias: "widget.commentsUsers",
    extend: 'Ext.panel.Panel',
    componentCls: "comments-users",
    requires: ["Docs.Comments"],

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
                height: 25,
                items: [
                    {
                        title: "Votes"
                    },
                    {
                        title: "Comments"
                    }
                ],
                listeners: {
                    tabchange: this.onTabChange,
                    scope: this
                }
            }),
            this.usersList = Ext.widget("dataview", {
                region: "center",
                cls: "iScroll users-list",
                autoScroll: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ["username", "score", "emailHash", "moderator"]
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{score}</span>',
                            '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/{emailHash}',
                                  '?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                            '<span class="username <tpl if="moderator">moderator</tpl>">{username}</span>',
                        '</li>',
                    '</tpl>',
                    '</ul>'
                ],
                itemSelector: "li",
                listeners: {
                    select: this.onSelect,
                    deselect: this.onDeselect,
                    scope: this
                }
            })
        ];

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

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.usersList.getSelectionModel().deselectAll();
    },

    onSelect: function(view, user) {
        this.selectedUser = user;
        this.fireEvent("select", user.get("username"));
    },

    onDeselect: function() {
        // Don't fire empty "select" event when the deselect occured
        // only because another user was selected (and so the previous
        // was unselected).  Wait a tiny delay and when no user
        // becomes selected, onle then fire the empty select event.
        this.selectedUser = undefined;
        Ext.Function.defer(function() {
            if (!this.selectedUser) {
                this.fireEvent("select", undefined);
            }
        }, 10, this);
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
        this.usersList.getStore().loadData(users);
        if (this.selectedUser) {
            var index = this.usersList.getStore().findExact("username", this.selectedUser.get("username"));
            this.usersList.getSelectionModel().select(index, false, true);
        }
    }
});
