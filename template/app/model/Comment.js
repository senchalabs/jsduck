/**
 * A comment model.
 */
Ext.define('Docs.model.Comment', {
    extend: 'Ext.data.Model',
    requires: [
        "Docs.Comments"
    ],
    fields: [
        {name: "id", mapping: "_id"},
        "author",
        "emailHash",
        "moderator",
        "createdAt",
        "target",
        "score",
        "upVote",
        "downVote",
        "contentHtml",
        "read",
        "tags",
        "deleted",
        "parentId",
        "replyCount"
    ],
    proxy: {
        type: "ajax",
        reader: "json"
    },

    /**
     * Votes the comment up or down.
     * @param {"up"/"down"} direction
     * @param {Object} cfg Additional configuration
     * @param {Function} cfg.failure
     * @param {Object} cfg.scope
     */
    vote: function(direction, cfg) {
        this.request({
            method: 'POST',
            url: '/comments/' + this.get("id"),
            params: { vote: direction },
            success: function(data) {
                this.set("upVote", data.direction === "up");
                this.set("downVote", data.direction === "down");
                this.set("score", data.total);
                this.commit();
            },
            failure: Ext.Function.bind(cfg.failure, cfg.scope),
            scope: this
        });
    },

    /**
     * Loads the plain Markdown content of comment.
     * @param {Function} callback Called with the plain Markdown content.
     * @param {Object} scope
     */
    loadContent: function(callback, scope) {
        this.request({
            url: '/comments/' + this.get("id"),
            method: 'GET',
            success: function(data) {
                callback.call(scope, data.content);
            },
            scope: this
        });
    },

    /**
     * Saves the plain Markdown content of comment.
     * @param {String} newContent The new content.
     */
    saveContent: function(newContent) {
        this.request({
            url: '/comments/' + this.get("id"),
            method: 'POST',
            params: {
                content: newContent
            },
            success: function(data) {
                this.set("contentHtml", data.content);
                this.commit();
            },
            scope: this
        });
    },

    /**
     * Marks the comment as deleted or undoes the delete.
     * @param {Boolean} deleted True to delete, false to undo.
     */
    setDeleted: function(deleted) {
        this.request({
            url: '/comments/' + this.get("id") + (deleted ? '/delete' : '/undo_delete'),
            method: 'POST',
            success: function() {
                this.set("deleted", deleted);
                this.commit();
                Docs.Comments.changeCount(this.get("target"), deleted ? -1 : +1);
            },
            scope: this
        });
    },

    /**
     * Marks the comment as read.
     */
    markRead: function() {
        this.request({
            url: '/comments/' + this.get("id") + '/read',
            method: 'POST',
            success: function() {
                this.set("read", true);
                this.commit();
            },
            scope: this
        });
    },

    /**
     * Sets new parent for the comment.
     * @param {Docs.model.Comment} parent The parent comment
     * (pass undefined to remove the parent from comment).
     * @param {Function} callback
     * @param {Object} scope
     */
    setParent: function(parent, callback, scope) {
        this.request({
            url: '/comments/' + this.get("id") + '/set_parent',
            method: 'POST',
            params: parent ? {parentId: parent.get("id")} : undefined,
            success: callback,
            scope: scope
        });
    },

    /**
     * Adds tag to comment.
     * @param {String} tagname
     */
    addTag: function(tagname) {
        this.changeTag("add_tag", tagname, function() {
            this.get("tags").push(tagname);
        }, this);
    },

    /**
     * Removes tag from comment.
     * @param {String} tagname
     */
    removeTag: function(tagname) {
        this.changeTag("remove_tag", tagname, function() {
            Ext.Array.remove(this.get("tags"), tagname);
        }, this);
    },

    // helper for doing add_tag/remove_tag requests
    changeTag: function(action, tagname, callback, scope) {
        this.request({
            url: '/comments/' + this.get("id") + '/' + action,
            method: 'POST',
            params: {
                tagname: tagname
            },
            success: function() {
                callback.call(scope);
                this.commit();
            },
            scope: this
        });
    },

    request: function(cfg) {
        Docs.Comments.request("ajax", {
            url: cfg.url,
            method: cfg.method,
            params: cfg.params,
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    cfg.success && cfg.success.call(cfg.scope, data);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
    }
});
