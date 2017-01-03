/**
 * The comments expander, showing the number of comments.
 */
Ext.define('Docs.view.comments.Expander', {
    alias: "widget.commentsExpander",
    extend: 'Ext.Component',
    requires: [
        'Docs.Comments',
        'Docs.view.comments.TopLevelDropZone'
    ],
    uses: [
        'Docs.view.comments.ListWithForm'
    ],
    componentCls: "comments-expander",

    /**
     * @cfg {String[]} target
     * The target specification array `[type, cls, member]`.
     */
    /**
     * @cfg {Number} count
     */
    /**
     * @cfg {String} newCommentTitle
     * A custom title for the new comment form.
     */

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<a href="#" class="side toggleComments"><span></span></a>',
            '<a href="#" class="name toggleComments">',
                '{[this.renderCount(values.count)]}',
            '</a>',
            {
                renderCount: this.renderCount
            }
        );

        this.data = {
            count: this.count
        };

        this.callParent(arguments);
    },

    renderCount: function(count) {
        if (count === 1) {
            return 'View 1 comment.';
        }
        else if (count > 1) {
            return 'View ' + count + ' comments.';
        }
        else {
            return 'No comments. Click to add.';
        }
    },

    afterRender: function() {
        this.callParent(arguments);

        this.getEl().select(".toggleComments").each(function(el) {
            el.on("click", this.toggle, this, {
                preventDefault: true
            });
        }, this);

        new Docs.view.comments.TopLevelDropZone(this.getEl().down(".side.toggleComments"), {
            onValidDrop: Ext.Function.bind(this.setParent, this)
        });
    },

    setParent: function(comment, parent) {
        comment.setParent(parent, this.reload, this);
    },

    toggle: function() {
        this.expanded ? this.collapse() : this.expand();
    },

    /**
     * Expands the comments list.
     */
    expand: function() {
        this.expanded = true;
        this.getEl().addCls('open');
        this.getEl().down('.name').setStyle("display", "none");

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
        this.getEl().removeCls('open');
        this.getEl().down('.name').setStyle("display", "block");

        if (this.list) {
            this.list.hide();
        }
    },

    loadComments: function() {
        this.list = new Docs.view.comments.ListWithForm({
            target: this.target,
            newCommentTitle: this.newCommentTitle,
            renderTo: this.getEl(),
            listeners: {
                reorder: this.reload,
                scope: this
            }
        });

        this.reload();
    },

    // Reloads the comments list from backend.
    reload: function() {
        Docs.Comments.load(this.target, function(comments) {
            this.list.load(comments);
        }, this);
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.getEl().down(".name").update(this.renderCount(count));
    }

});
