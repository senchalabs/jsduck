/**
 * Container for recent comments and top users.
 */
Ext.define('Docs.view.comments.HeaderMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.commentsHeaderMenu',
    componentCls: "comments-header-menu",
    html: '<h1><a href="#" class="users selected">Users</a> <a href="#" class="targets">Topics</a></h1>',

    /**
     * @event select
     * Fired when item in header menu selected.
     * @param {String} name Either "users" or "targets".
     */

    afterRender: function() {
        this.callParent(arguments);

        var users = this.getEl().down("a.users");
        var targets = this.getEl().down("a.targets");

        users.on("click", function(event, target) {
            users.addCls("selected");
            targets.removeCls("selected");
            this.fireEvent("select", "users");
        }, this, {preventDefault: true});

        targets.on("click", function(event, target) {
            targets.addCls("selected");
            users.removeCls("selected");
            this.fireEvent("select", "targets");
        }, this, {preventDefault: true});
    }
});
