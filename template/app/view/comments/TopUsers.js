/**
 * View for showing users.
 * Either sorted by upvotes or comment count.
 */
Ext.define('Docs.view.comments.TopUsers', {
    alias: "widget.topusers",
    extend: 'Ext.panel.Panel',
    componentCls: "top-users",

    dockedItems: [
        {
            xtype: 'container',
            dock: 'top',
            height: 35,
            html: '<h1>Users</h1>'
        }
    ],

    layout: "border",
    items: [
        {
            xtype: "tabpanel",
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
            ]
        },
        {
            region: "center",
            xtype: 'container',
            cls: "iScroll users-list",
            autoScroll: true
        }
    ],

    initComponent: function() {
        this.callParent(arguments);

        this.tabpanel = this.down("tabpanel");
        this.usersList = this.down("container[region=center]");

        this.tabpanel.on("tabchange", function(panel, newTab) {
            if (newTab.title === "Votes") {
                this.fetchUsers("votes");
            }
            else {
                this.fetchUsers("comments");
            }
        }, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.fetchUsers("votes");
    },

    fetchUsers: function(sortBy) {
        this.request("jsonp", {
            url: '/users',
            method: 'GET',
            params: {
                sortBy: sortBy
            },
            success: function(users) {
                this.renderUsers(users);
            },
            scope: this
        });
    },

    request: function(type, config) {
        Docs.App.getController("Comments").request(type, config);
    },

    renderUsers: function(users) {
        var tpl = new Ext.XTemplate(
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
        );
        tpl.overwrite(this.usersList.getEl(), users);
    }
});
