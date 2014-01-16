/**
 * DropZone for comments drag-drop reorganization.
 */
Ext.define("Docs.view.comments.DropZone", {
    extend: 'Ext.dd.DropZone',

    constructor: function(view, config) {
        this.view = view;
        this.callParent([view.getEl(), config]);
    },

    getTargetFromEvent: function(e) {
        return e.getTarget(this.view.itemSelector, 10);
    },

    onNodeEnter: function(target, dd, e, data) {
        if (this.isValidDropTarget(target, data)) {
            Ext.fly(target).addCls('drop-target-hover');
        }
    },

    onNodeOut: function(target, dd, e, data) {
        Ext.fly(target).removeCls('drop-target-hover');
    },

    onNodeOver: function(target, dd, e, data) {
        if (this.isValidDropTarget(target, data)) {
            // Return the built-in dropAllowed CSS class.
            return this.dropAllowed;
        }
        else {
            return false;
        }
    },

    isValidDropTarget: function(target, data) {
        var targetComment = this.view.getRecord(target);
        return targetComment && targetComment.get("id") !== data.comment.get("id");
    },

    onNodeDrop: function(target, dd, e, data) {
        if (this.isValidDropTarget(target, data)) {
            this.onValidDrop(data.comment, this.view.getRecord(target));
            return true;
        }
        return false;
    },

    /**
     * Called when comment successfully dropped on another one.
     * @template
     * @param {Docs.model.Comment} comment The comment that was dragged.
     * @param {Docs.model.Comment} parent The comment that it got dropped on.
     */
    onValidDrop: Ext.emptyFn
});
