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
        'Docs.view.comments.TagEditor',
        'Docs.view.comments.RepliesExpander',
        'Docs.view.comments.DragZone',
        'Docs.view.comments.DropZone',
        'Docs.model.Comment',
        'Docs.Tip'
    ],
    componentCls: 'comments-list',

    itemSelector: "div.comment",

    emptyText: '<div class="loading">Loading...</div>',
    deferEmptyText: false,

    /**
     * @cfg {Boolean} showTarget
     * True to show a link to the target in each comment.
     * Used in Docs.view.comments.FullList.
     */

    /**
     * @cfg {Boolean} enableDragDrop
     * True to allow drag-drop reorganization of comments.
     */

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            model: "Docs.model.Comment",
            listeners: {
                update: this.fireChangeEvent,
                scope: this
            }
        });

        this.tpl = Docs.view.comments.Template.create({
            showTarget: this.showTarget,
            enableDragDrop: this.enableDragDrop
        });

        this.callParent(arguments);

        this.on("refresh", function() {
            Docs.Syntax.highlight(this.getEl());
            this.renderExpanders(this.store.getRange());
        }, this);
        this.on("itemupdate", function(comment, index, node) {
            Docs.Syntax.highlight(node);
            this.renderExpanders([comment]);
        }, this);
    },

    renderExpanders: function(comments) {
        if (comments[0] && comments[0].get("parentId")) {
            return;
        }

        Ext.Array.forEach(comments, function(comment) {
            // add no expanders for deleted comments.
            if (comment.get("deleted")) {
                return;
            }

            new Docs.view.comments.RepliesExpander({
                count: comment.get("replyCount"),
                target: comment.get("target"),
                parentId: comment.get("id"),
                renderTo: this.getNode(comment)
            });
        }, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        // Remove the keydown handler set up in Ext.view.View#afterRender
        // which prevents CodeMirror from receiving the event when the SPACE key is pressed.
        this.mun(this.getTargetEl(), "keydown");

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

        this.delegateClick("a.readComment", this.markRead, this);

        this.delegateClick("a.add-tag", this.addTag, this);
        this.delegateClick("a.remove-tag", this.removeTag, this);

        // initialize drag-drop
        if (this.enableDragDrop) {
            new Docs.view.comments.DragZone(this);
            new Docs.view.comments.DropZone(this, {
                onValidDrop: Ext.Function.bind(this.setParent, this)
            });
        }
    },

    delegateClick: function(selector, callback, scope) {
        this.getEl().on("click", function(event, el) {
            var comment = this.getRecord(this.findItemByChild(el));
            // In case of replies to comments, this handler will also
            // pick up events really targeted for the sublist, but we
            // don't want to act on these.  But in such case the view
            // is unable to find the corresponding record - so we stop
            // here.
            if (comment) {
                callback.call(scope, el, comment);
            }
        }, this, {preventDefault: true, delegate: selector});
    },

    vote: function(el, comment, direction) {
        if (!Docs.Auth.isLoggedIn()) {
            Docs.Tip.show('Please login to vote on this comment', el);
            return;
        }
        if (comment.get("upVote") && direction === "up" || comment.get("downVote") && direction === "down") {
            Docs.Tip.show('You have already voted on this comment', el);
            return;
        }

        comment.vote(direction, {failure: function(msg) {
            Docs.Tip.show(msg, el);
        }});
    },

    // starts an editor on the comment
    edit: function(el, comment) {
        comment.loadContent(function(content) {
            // empty the content of comment.
            var contentEl = Ext.get(el).up(".comment").down(".content");
            contentEl.update("");

            new Docs.view.comments.Form({
                renderTo: contentEl,
                title: '<b>Edit comment</b>',
                user: Docs.Auth.getUser(),
                content: content,
                listeners: {
                    submit: function(newContent) {
                        comment.saveContent(newContent);
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

    // marks the comment as deleted or undoes the delete
    setDeleted: function(el, comment, deleted) {
        comment.setDeleted(deleted);
    },

    markRead: function(el, comment) {
        comment.markRead();
    },

    addTag: function(el, comment) {
        var editor = new Docs.view.comments.TagEditor();
        editor.on("select", comment.addTag, comment);
        editor.popup(el);
    },

    removeTag: function(el, comment) {
        var tagname = Ext.get(el).up(".tag").down("b").getHTML();
        comment.removeTag(tagname);
    },

    setParent: function(comment, parent) {
        comment.setParent(parent, function() {
            /**
             * @event reorder
             * Fired when comments reordered with drag-drop.
             */
            this.fireEvent("reorder");
        }, this);
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
        this.fireChangeEvent();
    },

    fireChangeEvent: function() {
        /**
         * @event countChange
         * Fired when nr of comments in list changes.
         * @param {Number} count
         */
        var isNotDeleted = function(c) {
            return !c.get("deleted");
        };
        this.fireEvent("countChange", this.getStore().queryBy(isNotDeleted).getCount());
    }

});
