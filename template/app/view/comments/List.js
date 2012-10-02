/**
 * Shows the listing of comments.
 */
Ext.define('Docs.view.comments.List', {
    extend: 'Ext.view.View',
    alias: 'widget.commentsList',
    requires: [
        'Docs.Auth',
        'Docs.Syntax',
        'Docs.Comments',
        'Docs.view.comments.Template',
        'Docs.view.comments.Form',
        'Docs.model.Comment',
        'Docs.Tip'
    ],

    itemSelector: "div.comment",

    emptyText: '<div class="loading">Loading...</div>',
    deferEmptyText: false,

    /**
     * @cfg {Boolean} showTarget
     * True to show a link to the target in each comment.
     * Used in Docs.view.comments.FullList.
     */

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            model: "Docs.model.Comment"
        });

        this.tpl = Docs.view.comments.Template.create({showTarget: this.showTarget});

        this.callParent(arguments);

        this.on("refresh", function() {
            Docs.Syntax.highlight(this.getEl());
        }, this);
        this.on("itemupdate", function(record, index, node) {
            Docs.Syntax.highlight(node);
        }, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.delegateClick("a.voteCommentUp", function(el, r) {
            this.vote(el, r, "up");
        }, this);
        this.delegateClick("a.voteCommentDown", function(el, r) {
            this.vote(el, r, "down");
        }, this);
        this.delegateClick("a.editComment", function(el, r) {
            this.edit(el, r);
        }, this);
        this.delegateClick("a.deleteComment", function(el, r) {
            this.setDeleted(el, r, true);
        }, this);
        this.delegateClick("a.undoDeleteComment", function(el, r) {
            this.setDeleted(el, r, false);
        }, this);
    },

    delegateClick: function(selector, callback, scope) {
        this.getEl().on("click", function(event, el) {
            callback.call(scope, el, this.getRecord(this.findItemByChild(el)));
        }, this, {preventDefault: true, delegate: selector});
    },

    vote: function(el, record, direction) {
        if (!Docs.Auth.isLoggedIn()) {
            Docs.Tip.show('Please login to vote on this comment', el);
            return;
        }
        if (record.get("upVote") && direction === "up" || record.get("downVote") && direction === "down") {
            Docs.Tip.show('You have already voted on this comment', el);
            return;
        }

        Docs.Comments.request("ajax", {
            url: '/comments/' + record.get("id"),
            method: 'POST',
            params: { vote: direction },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    record.set("score", data.total);
                    record.set("upVote", data.direction === "up");
                    record.set("downVote", data.direction === "down");
                    record.commit();
                }
                else {
                    Docs.Tip.show(data.reason, el);
                }
            },
            scope: this
        });
    },

    // starts an editor on the comment
    edit: function(el, comment) {
        this.loadContent(comment, function(content) {
            var contentEl = Ext.get(el).up(".comment").down(".content");
            new Docs.view.comments.Form({
                renderTo: contentEl,
                user: Docs.Auth.getUser(),
                content: content,
                listeners: {
                    submit: function(newContent) {
                        this.saveContent(comment, newContent, function(contentHtml) {
                            comment.set("contentHtml", contentHtml);
                            comment.commit();
                        }, this);
                    },
                    cancel: function() {
                        this.refreshComment(comment);
                    },
                    scope: this
                }
            });
        }, this);
    },

    // re-renders the comment, discarding the form.
    refreshComment: function(comment) {
        this.refreshNode(this.getStore().findExact("id", comment.get("id")));
    },

    loadContent: function(comment, callback, scope) {
        Docs.Comments.request("ajax", {
            url: '/comments/' + comment.get("id"),
            method: 'GET',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    callback.call(scope, data.content);
                }
            },
            scope: this
        });
    },

    saveContent: function(comment, newContent, callback, scope) {
        Docs.Comments.request("ajax", {
            url: '/comments/' + comment.get("id"),
            method: 'POST',
            params: {
                content: newContent
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    callback.call(scope, data.content);
                }
            },
            scope: this
        });
    },

    // marks the comment as deleted or undoes the delete
    setDeleted: function(el, comment, deleted) {
        Docs.Comments.request("ajax", {
            url: '/comments/' + comment.get("id") + (deleted ? '/delete' : '/undo_delete'),
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    comment.set("deleted", deleted);
                    comment.commit();
                }
                else {
                    Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
                }
            },
            scope: this
        });
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     * @param {Boolean} append True to append the comments to existing ones.
     */
    load: function(comments, append) {
        // hide the spinning loader when no comments.
        if (comments.length === 0) {
            this.emptyText = "";
        }

        var processedComments = this.store.getProxy().getReader().readRecords(comments).records;
        this.store.loadData(processedComments, append);
    }

});
