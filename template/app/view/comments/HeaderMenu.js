/**
 * Menu for selecting between Users / Targets / Tags.
 */
Ext.define('Docs.view.comments.HeaderMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.commentsHeaderMenu',
    componentCls: "comments-header-menu",
    html: [
        '<h1>',
        '  <a href="#" class="users selected">Users</a>',
        '  <a href="#" class="targets">Topics</a>',
        '  <a href="#" class="tags">Tags</a>',
        '</h1>'
    ].join(""),

    /**
     * @event select
     * Fired when item in header menu selected.
     * @param {String} type Either "users", "targets" or "tags".
     */

    afterRender: function() {
        this.callParent(arguments);

        Ext.Array.forEach(["users", "targets", "tags"], function(type) {
            var link = this.getEl().down("a."+type);

            link.on("click", function(event, target) {
                this.getEl().select("a", true).removeCls("selected");
                link.addCls("selected");
                this.fireEvent("select", type);
            }, this, {preventDefault: true});
        }, this);
    }
});
