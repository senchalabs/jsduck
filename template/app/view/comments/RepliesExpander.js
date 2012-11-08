/**
 * The comment replies expander, showing the number of replies.
 */
Ext.define('Docs.view.comments.RepliesExpander', {
    alias: "widget.commentsRepliesExpander",
    extend: 'Ext.Component',
    requires: [
        'Docs.Comments'
    ],
    uses: [
        'Docs.view.comments.ListWithForm'
    ],
    componentCls: "comments-replies-expander",

    /**
     * @cfg {String[]} target
     * The target specification array `[type, cls, member]`.
     */
    /**
     * @cfg {String[]} parentId
     * ID of the parent comment, if any.
     */
    /**
     * @cfg {Number} count
     */

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<a href="#" class="replies-button {[this.getCountCls(values.count)]}">',
                '{[this.renderCount(values.count)]}',
            '</a>',
            {
                renderCount: this.renderCount,
                getCountCls: this.getCountCls
            }
        );

        this.data = {
            count: this.count
        };

        this.callParent(arguments);
    },

    renderCount: function(count) {
        if (count === 1) {
            return '1 reply...';
        }
        else if (count > 1) {
            return count + ' replies...';
        }
        else {
            return 'Write reply...';
        }
    },

    getCountCls: function(count) {
        return (count > 0) ? 'with-replies' : '';
    },

    afterRender: function() {
        this.callParent(arguments);
        this.getEl().down(".replies-button").on("click", this.toggle, this, {
            preventDefault: true
        });
    },

    toggle: function() {
        this.expanded ? this.collapse() : this.expand();
    },

    /**
     * Expands the comments list.
     */
    expand: function() {
        this.expanded = true;
        this.getEl().down('.replies-button').update("Hide replies.");

        if (this.list) {
            this.list.show();
        }
        else {
            this.loadComments();
        }
    },

    /**
     * Collapses the comments list, leaving just count.
     */
    collapse: function() {
        this.expanded = false;
        this.refreshRepliesButton();

        if (this.list) {
            this.list.hide();
        }
    },

    refreshRepliesButton: function() {
        var btn = this.getEl().down('.replies-button');
        btn.update(this.renderCount(this.count));
        btn.removeCls("with-replies");
        btn.addCls(this.getCountCls(this.count));
    },

    loadComments: function() {
        this.list = new Docs.view.comments.ListWithForm({
            target: this.target,
            parentId: this.parentId,
            newCommentTitle: "<b>Reply to comment</b>",
            renderTo: this.getEl(),
            listeners: {
                countChange: this.setCount,
                scope: this
            }
        });

        Docs.Comments.loadReplies(this.parentId, function(comments) {
            this.list.load(comments);
        }, this);
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.count = count;
        if (!this.expanded) {
            this.refreshRepliesButton();
        }
    }

});
